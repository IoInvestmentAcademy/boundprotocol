import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/context/WalletContext";
import { vaultApi } from "@/lib/axios";
import { VaultDeployment } from "@/types/vault";
import { useState } from "react";

export function useVaultDeployments(chainId: number | null) {
  const [deployments, setDeployments] = useState<VaultDeployment[]>([]);
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(true);
  const [deploymentsError, setDeploymentsError] = useState<Error | null>(null);
  const [isDepositingAfterLaunch, setIsDepositingAfterLaunch] = useState(false);
  const [isDepositedAfterLaunch, setIsDepositedAfterLaunch] = useState(false);
  const [depositAfterLaunchError, setDepositAfterLaunchError] =
    useState<Error | null>(null);
  const [isSellingLP, setIsSellingLP] = useState(false);

  const {
    data: deploymentsData = [],
    isLoading: isLoadingDeploymentsData,
    error: deploymentsErrorData,
  } = useQuery({
    queryKey: ["vaults", chainId],
    queryFn: async (): Promise<VaultDeployment[]> => {
      if (!chainId) {
        return [];
      }

      const { data } = await vaultApi.get<VaultDeployment[]>(
        `/vaults?chainId=${chainId}`
      );
      // filter that vaults that are active are are at the top of the list
      // do not remove inactive vaults just put it at the bottom of the list
      const filteredData = data.sort((a, b) => (b.active ? 1 : -1));
      return filteredData;
    },
    enabled: Boolean(chainId),
    retry: 4,
    staleTime: 30000,
    refetchInterval: 60000, // Refetch every 60 seconds (1 minute)
    refetchIntervalInBackground: true, // Optional: continue fetching even when the window is in background
  });

  const depositAfterLaunch = async (params: any) => {
    try {
      setIsDepositingAfterLaunch(true);
      // Implement deposit logic here
      setIsDepositedAfterLaunch(true);
    } catch (error) {
      setDepositAfterLaunchError(error as Error);
    } finally {
      setIsDepositingAfterLaunch(false);
    }
  };

  const sellLP = async (params: any) => {
    try {
      setIsSellingLP(true);
      // Implement sell LP logic here
    } catch (error) {
      console.error("Error selling LP:", error);
    } finally {
      setIsSellingLP(false);
    }
  };

  return {
    deployments: deploymentsData,
    isLoadingDeployments: isLoadingDeploymentsData,
    deploymentsError: deploymentsErrorData,
    depositAfterLaunch,
    isDepositingAfterLaunch,
    isDepositedAfterLaunch,
    depositAfterLaunchError,
    sellLP,
    isSellingLP,
  };
}
