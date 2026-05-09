import { createHash } from "crypto";
import { ipAddress } from "@vercel/functions";
import { NextResponse } from "next/server";

type MetaEventName = "PageView" | "ViewContent" | "Lead";

type MetaConversionsPayload = {
  eventName?: MetaEventName;
  eventId?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  userData?: Record<string, unknown>;
  customData?: Record<string, unknown>;
};

const metaPixelId = "1492754292286984";
const graphApiVersion = "v21.0";
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

  if (key === "ph") {
    return normalized.replace(/\D/g, "");
  }

  return normalized;
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as MetaConversionsPayload | null;

  if (!body?.eventName || !["PageView", "ViewContent", "Lead"].includes(body.eventName)) {
    return NextResponse.json({ error: "Invalid Meta event" }, { status: 400 });
  }

  const accessToken =
    process.env.PIXEL_ACCESS_TOKEN?.trim() ||
    process.env.FACEBOOK_ACCESS_TOKEN?.trim() ||
    process.env.FACEBOOK_PIXEL_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    return NextResponse.json({ ok: true, sent: false, reason: "missing_access_token" });
  }

  const eventSourceUrl = normalizeString(body.eventSourceUrl);
  const userAgent = request.headers.get("user-agent") || "";
  const requestIp = getRequestIp(request);
  const userData = cleanObject({
    ...normalizeAndHashUserData(body.userData),
    client_ip_address: requestIp || undefined,
    client_user_agent: userAgent || undefined,
    fbp: normalizeString(body.fbp) || undefined,
    fbc: normalizeString(body.fbc) || undefined,
  });

  const event = cleanObject({
    event_name: body.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: normalizeString(body.eventId) || `${body.eventName}-${Date.now()}`,
    event_source_url: eventSourceUrl || request.headers.get("referer") || undefined,
    action_source: "website",
    user_data: userData,
    custom_data: cleanObject(body.customData),
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
    return NextResponse.json(
      { error: "Meta Conversions API rejected event" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, sent: true, result });
}
