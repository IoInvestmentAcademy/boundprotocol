import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { getViemClient } from "@/utils/viemClient";
import { decodeCollectFees } from "@/utils/decodeMessage";
import { VaultDeployment } from "@/types/vault";

interface InvestorDetailsProps {
  provider: ethers.Provider | null;
  account: string | null;
  msoAddress: string | null;
  chainId: number | null;
  vaultData: {
    vault: VaultDeployment;
  } | null;
  enabled?: boolean;
}

interface InvestorDetails {
  beforeLaunchBalance: string;
  afterLaunchBalance: string;
  poolFeesProfit: string;
  poolFeesProfit2: string;
}

export const useInvestorDetails = ({
  provider,
  account,
  msoAddress,
  chainId,
  vaultData,
  enabled = true,
}: InvestorDetailsProps) => {
  return useQuery<InvestorDetails>({
    queryKey: ["investorDetails", msoAddress, account],
    queryFn: async () => {
      if (!provider || !account || !msoAddress || !vaultData || !chainId) {
        throw new Error("Missing required parameters");
      }

      const msoContract = new ethers.Contract(
        msoAddress as string,
        MSO_ABI,
        provider
      );

      const publicClient = getViemClient(chainId);

      // Simulate collectFees
      const simulationResult = await publicClient.simulateContract({
        address: msoAddress as `0x${string}`,
        abi: MSO_ABI,
        functionName: "collectFees",
        args: [],
        account: account as `0x${string}`,
      });

      const decoded = decodeCollectFees(simulationResult.result);

      const [beforeLaunch, afterLaunch] = await Promise.all([
        msoContract.iBalance(account),
        msoContract.iBalanceAfterLaunch(account),
      ]);

      let poolFeesProfit2: bigint = BigInt(0);

      // Only simulate collectIndividualPositionFees if afterLaunch is greater than 0
      if (afterLaunch > "0") {
        try {
          const individualFeesSimulation = await publicClient.simulateContract({
            address: msoAddress as `0x${string}`,
            abi: MSO_ABI,
            functionName: "collectIndividualPositionFees",
            args: [],
            account: account as `0x${string}`,
          });

          const decoded2 = decodeCollectFees(individualFeesSimulation.result);
          poolFeesProfit2 = decoded2[0];
        } catch (error) {
          console.error(
            "Error simulating collectIndividualPositionFees:",
            error
          );
        }
      }

      return {
        beforeLaunchBalance: ethers.formatUnits(
          beforeLaunch,
          vaultData.vault.denominationAssetDecimals
        ),
        afterLaunchBalance: ethers.formatUnits(
          afterLaunch,
          vaultData.vault.denominationAssetDecimals
        ),
        poolFeesProfit: ethers.formatUnits(
          decoded[0],
          vaultData.vault.denominationAssetDecimals
        ),
        poolFeesProfit2: ethers.formatUnits(
          poolFeesProfit2,
          vaultData.vault.denominationAssetDecimals
        ),
      };
    },
    enabled:
      enabled &&
      !!provider &&
      !!account &&
      !!msoAddress &&
      !!vaultData &&
      !!chainId,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
