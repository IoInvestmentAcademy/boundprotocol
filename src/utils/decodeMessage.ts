import { decodeAbiParameters } from "viem";

export function decodeCollectFees(rawResult: `0x${string}`) {
  const decoded = decodeAbiParameters(
    [{ type: "uint256" }, { type: "uint256" }],
    rawResult
  );

  console.log("Remaining Fee A:", decoded[0]);
  console.log("Remaining Fee B:", decoded[1]);
  return decoded;
}
