export function splitSignature(signature: string) {
  // Remove the '0x' prefix if present
  const cleanSignature = signature.replace("0x", "");

  // Split the signature into r, s, v components
  const r = "0x" + cleanSignature.substring(0, 64);
  const s = "0x" + cleanSignature.substring(64, 128);
  const v = parseInt(cleanSignature.substring(128, 130), 16);

  return { r, s, v };
}
