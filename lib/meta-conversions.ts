import { createHash } from "crypto";
import { ipAddress } from "@vercel/functions";

export type MetaEventName = "PageView" | "ViewContent" | "Lead";

type MetaConversionInput = {
  eventName: MetaEventName;
  eventId?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  userData?: Record<string, unknown>;
  customData?: Record<string, unknown>;
};

const graphApiVersion = "v21.0";
const metaPixelId = "1492754292286984";
const hashableUserDataKeys = new Set([
  "em",
  "ph",
  "fn",
  "ln",
  "ct",
  "st",
  "zp",
  "country",
  "external_id",
]);

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeHashInput(key: string, value: string) {
  const normalized = value.trim().toLowerCase();
  return key === "ph" ? normalized.replace(/\D/g, "") : normalized;
}

function normalizeAndHashUserData(userData: Record<string, unknown> = {}) {
  const normalizedEntries = Object.entries(userData).flatMap(([key, value]) => {
    if (!hashableUserDataKeys.has(key)) return [];

    const stringValue = normalizeString(value);
    if (!stringValue) return [];

    const hashInput = normalizeHashInput(key, stringValue);
    return hashInput ? [[key, sha256(hashInput)]] : [];
  });

  return Object.fromEntries(normalizedEntries);
}

function cleanObject(data: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== "" && value != null)
  );
}

function getRequestIp(request: Request) {
  return (
    ipAddress(request) ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    ""
  );
}

export async function sendMetaConversionEvent(
  request: Request,
  input: MetaConversionInput
) {
  const accessToken =
    process.env.PIXEL_ACCESS_TOKEN?.trim() ||
    process.env.FACEBOOK_ACCESS_TOKEN?.trim() ||
    process.env.FACEBOOK_PIXEL_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    return { ok: true, sent: false, reason: "missing_access_token" };
  }

  const userData = cleanObject({
    ...normalizeAndHashUserData(input.userData),
    client_ip_address: getRequestIp(request) || undefined,
    client_user_agent: request.headers.get("user-agent") || undefined,
    fbp: normalizeString(input.fbp) || undefined,
    fbc: normalizeString(input.fbc) || undefined,
  });

  const event = cleanObject({
    event_name: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: normalizeString(input.eventId) || `${input.eventName}-${Date.now()}`,
    event_source_url: normalizeString(input.eventSourceUrl) || request.headers.get("referer") || undefined,
    action_source: "website",
    user_data: userData,
    custom_data: cleanObject(input.customData),
  });

  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion}/${metaPixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [event] }),
      cache: "no-store",
    }
  );
  const result = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    console.error("Meta Conversions API failed", result);
    return { ok: false, sent: false, result };
  }

  return { ok: true, sent: true, result };
}
