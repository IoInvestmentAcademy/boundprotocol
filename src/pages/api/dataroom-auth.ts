import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE = "bound_dataroom";
const MAX_AGE = 60 * 60 * 24; // 24 hours

function expectedCode() {
  return process.env.DATAROOM_ACCESS_CODE || "792";
}

function isUnlocked(req: NextApiRequest) {
  return req.cookies?.[COOKIE] === "1";
}

function unlockCookie(secure: boolean) {
  const parts = [
    `${COOKIE}=1`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ unlocked: isUnlocked(req) });
  }

  if (req.method === "POST") {
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (!code || code !== expectedCode()) {
      return res.status(401).json({ ok: false, error: "invalid_code" });
    }

    res.setHeader("Set-Cookie", unlockCookie(process.env.NODE_ENV === "production"));
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "method_not_allowed" });
}
