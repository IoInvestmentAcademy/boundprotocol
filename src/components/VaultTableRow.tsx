import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { VaultDeployment } from "@/types/vault";
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { useWallet } from "@/context/WalletContext";
import { truncateAddress } from "@/utils/address";
import { useRouter } from "next/router";
import { getRpcUrl, getViemClient } from "@/utils/viemClient";
interface VaultTableRowProps {
  vault: VaultDeployment;
}

export function VaultTableRow({ vault }: VaultTableRowProps) {
  const router = useRouter();
  const { chainId } = useWallet();
  const [msoName, setMsoName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMsoName = async () => {
      if (!vault.mso.address || !chainId) return;

      const provider = new ethers.JsonRpcProvider(getRpcUrl(chainId));

      try {
        const msoContract = new ethers.Contract(
          vault.mso.address,
          MSO_ABI,
          provider
        );
        const name = await msoContract.name();
        setMsoName(name);
      } catch (error) {
        console.error("Error loading MSO name:", error);
        setMsoName("Error loading name");
      } finally {
        setIsLoading(false);
      }
    };

    loadMsoName();
  }, [chainId, vault.mso.address]);

  const handleRowClick = () => {
    // if address is 0x4245b7f9850322aD3F4F9064a5B803181F5F942f then push to /vaults/1
    if (vault.mso.address === "0x4245b7f9850322aD3F4F9064a5B803181F5F942f") {
      router.push(`/stable/${vault.mso.address}`);
    } else {
      router.push(`/vaults/${vault.mso.address}`);
    }

    // router.push(`/vaults/${vault.mso.address}`);
  };

  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        {isLoading ? (
          <div className="animate-pulse bg-gray-100 h-5 w-32 rounded"></div>
        ) : (
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900">{msoName}</span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 font-mono">
            {truncateAddress(vault.vault.address)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(vault.vault.address);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 font-mono">
            {truncateAddress(vault.mso.address)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(vault.mso.address);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            vault.launched
              ? "bg-green-100 text-green-800"
              : "bg-yellow-50 text-yellow-800"
          }`}
        >
          {vault.launched ? "Launched" : "Not Launched"}
        </span>
      </td>
    </tr>
  );
}
