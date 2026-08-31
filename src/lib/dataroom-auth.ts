/** HttpOnly session cookie set after a valid Data Room access code. */
export const DATAROOM_ACCESS_COOKIE = "bound_dataroom_access";

export const DATAROOM_ACCESS_MAX_AGE = 60 * 60 * 24; // 24 hours

export function dataroomAccessCode() {
  return process.env.DATAROOM_ACCESS_CODE || "792";
}

export function buildDataroomUnlockCookie(secure: boolean) {
  const parts = [
    `${DATAROOM_ACCESS_COOKIE}=1`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${DATAROOM_ACCESS_MAX_AGE}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
