import type { NextApiRequest, NextApiResponse } from "next";
import {
  DATAROOM_ACCESS_COOKIE,
  buildDataroomUnlockCookie,
  dataroomAccessCode,
} from "@/lib/dataroom-auth";

function isUnlocked(req: NextApiRequest) {
  return req.cookies?.[DATAROOM_ACCESS_COOKIE] === "1";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ unlocked: isUnlocked(req) });
  }

  if (req.method === "POST") {
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (!code || code !== dataroomAccessCode()) {
      return res.status(401).json({ ok: false, error: "invalid_code" });
    }

    res.setHeader("Set-Cookie", buildDataroomUnlockCookie(process.env.NODE_ENV === "production"));
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "method_not_allowed" });
}
