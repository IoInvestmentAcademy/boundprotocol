import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { IVault } from "./abi/IVault";
import { IComptrollerLib } from "./abi/IComptrollerLib";

interface VaultData {
  vaultOwner: string;
  depositToken: string;
  denominationAsset: string;
  isTransferable: boolean;
  projectName: string;
}

const HARDHAT_RPC_URL = "http://localhost:8545"; // Default Hardhat node URL

export function useVaultData(vaultAddress: string) {
  return useQuery<VaultData>({
    queryKey: ["vaultData", vaultAddress],
    queryFn: async () => {
      if (!ethers.isAddress(vaultAddress)) {
        throw new Error("Invalid vault address");
      }

      // const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL);
      const provider = new ethers.JsonRpcProvider(
        localStorage.getItem("providerUrl") as string
      );

      const vaultContract = new ethers.Contract(vaultAddress, IVault, provider);

      try {
        // Get vault owner
        const vaultOwner = await vaultContract.getOwner();

        const isTransferable =
          await vaultContract.sharesAreFreelyTransferable();

        // Get accessor address and create accessor contract
        const accessorAddress = await vaultContract.getAccessor();
        const projectName = await vaultContract.name();
        console.log("accessorAddress", accessorAddress);
        const accessorContract = new ethers.Contract(
          accessorAddress,
          IComptrollerLib,
          provider
        );

        // Get denomination asset
        const denominationAsset = await accessorContract.getDenominationAsset();

        return {
          vaultOwner,
          depositToken: accessorAddress,
          denominationAsset,
          isTransferable,
          projectName,
        };
      } catch (error) {
        console.error("Error fetching vault data:", error);
        throw new Error(
          "Failed to fetch vault data. Please check the address and try again."
        );
      }
    },
    enabled: Boolean(vaultAddress && vaultAddress.length === 42), // Only run query for valid addresses
    staleTime: Infinity, // Prevent automatic refetching
    gcTime: 1000 * 60 * 5, // Changed from cacheTime to gcTime
    retry: false, // Don't retry on failure
  });
}
