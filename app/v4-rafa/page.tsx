import { cookies } from "next/headers";
import V4RafaClientPage from "./client-page";

const ageRejectedCookieName = "bf_age_rejected";

export default async function Page() {
  const cookieStore = await cookies();
  const initialAgeRejected = cookieStore.get(ageRejectedCookieName)?.value === "true";

  return <V4RafaClientPage initialAgeRejected={initialAgeRejected} />;
}
