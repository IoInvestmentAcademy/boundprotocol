import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { IVault } from "@/hooks/abi/IVault";
import { erc20Abi } from "viem";
import { VaultDeployment } from "@/types/vault";

interface MsoDetailsProps {
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null;
  msoAddress: string | null;
  vaultData: {
    vault: VaultDeployment;
  } | null;
  enabled?: boolean;
}

interface MsoDetails {
  syncReserveA: string;
  vaultTokenBalance: string;
  denominationAssetBalance: string;
}

export const useMsoDetails = ({
  provider,
  msoAddress,
  vaultData,
  enabled = true,
}: MsoDetailsProps) => {
  return useQuery<MsoDetails>({
    queryKey: ["msoDetails", msoAddress, vaultData?.vault.vault.address],
    queryFn: async () => {
      if (!provider || !msoAddress || !vaultData) {
        throw new Error("Missing required parameters");
      }

      const msoContract = new ethers.Contract(
        msoAddress as string,
        MSO_ABI,
        provider
      );

      const vaultContract = new ethers.Contract(
        vaultData.vault.vault.address,
        IVault,
        provider
      );

      const denominationAssetContract = new ethers.Contract(
        vaultData.vault.denominationAsset,
        erc20Abi,
        provider
      );

      const [syncReserveA, vaultTokenBalance, denominationAssetBalance] =
        await Promise.all([
          msoContract.syncReserveA(),
          vaultContract.balanceOf(msoAddress),
          denominationAssetContract.balanceOf(msoAddress),
        ]);

      return {
        syncReserveA: ethers.formatUnits(
          syncReserveA,
          vaultData.vault.denominationAssetDecimals
        ),
        vaultTokenBalance: ethers.formatUnits(vaultTokenBalance, 18),
        denominationAssetBalance: ethers.formatUnits(
          denominationAssetBalance,
          vaultData.vault.denominationAssetDecimals
        ),
      };
    },
    enabled: enabled && !!provider && !!msoAddress && !!vaultData,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
