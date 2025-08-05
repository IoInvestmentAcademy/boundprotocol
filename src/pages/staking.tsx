import { StakingCard } from "@/components/StakingCard";

const MSO_EXCHANGE_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual address
const MSO_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual address
const SBOUND_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual address

export default function StakingPage() {
  const msoDetails = {
    syncReserveA: "1000000000000000000",
    vaultTokenBalance: "1000000000000000000",
    denominationAssetBalance: "1000000000000000000",
    denominationAssetName: "USD",
    msoTokenSymbol: "MSO",
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">MSO Staking</h1>
      <div className="max-w-3xl mx-auto">
        {/* <StakingCard
          exchangeAddress={MSO_EXCHANGE_ADDRESS}
          msoAddress={MSO_TOKEN_ADDRESS}
          sBOUNDAddress={SBOUND_TOKEN_ADDRESS}
          msoDetails={msoDetails}
          vaultData={vaultData}
        /> */}
      </div>
    </div>
  );
}
