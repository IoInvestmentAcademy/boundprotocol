import { useEffect, useState } from "react";
import { useVaultDeployments } from "@/hooks/useVaultDeployments";
import { ethers } from "ethers";
import { IERC20 } from "@/hooks/abi/IERC20"; // ABI for the token
import { MSO_ABI } from "@/hooks/abi/MSO_ABI";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";

import { ConfirmDialog } from "./ConfirmDialog";
import { Spinner } from "./Spinner";
import { MSOInitializer } from "@/hooks/abi/MSOInitializer";
import { VaultDeployment } from "@/types/vault";
import { VaultTableRow } from "./VaultTableRow";

// Define the Hardhat network configuration
const hardhatConfig = {
  id: 31337,
  name: "Hardhat",
  network: "hardhat",
  rpcUrls: ["http://127.0.0.1:8545/"],
};

// Create a public client for the Hardhat network
const publicClient = createPublicClient({
  ...hardhatConfig,
  transport: http(hardhatConfig.rpcUrls[0]),
});

export function DeployedVaults() {
  const {
    deployments: vaults,
    isLoadingDeployments,
    deploymentsError,
  } = useVaultDeployments(137);

  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

  if (isLoadingDeployments) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (deploymentsError) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Unable to load vaults</div>
          <div className="text-gray-500 text-sm">
            {deploymentsError.message}
          </div>
        </div>
      </div>
    );
  }

  if (!vaults?.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-2">No Vaults Found</div>
          <div className="text-gray-500 text-sm">
            Deploy a new vault to get started
          </div>
        </div>
      </div>
    );
  }

  const activeVaults = vaults.filter((vault) => vault.active).reverse();
  const inactiveVaults = vaults.filter((vault) => !vault.active);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === "active"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Active Synthetic Tokens</span>
              <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeVaults.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === "inactive"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Inactive Synthetic Tokens</span>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {inactiveVaults.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th scope="col" className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Synthetic Token
                  </span>
                </div>
              </th>
              <th scope="col" className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vault Address
                  </span>
                </div>
              </th>
              <th scope="col" className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    MSO Address
                  </span>
                </div>
              </th>
              <th scope="col" className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(activeTab === "active" ? activeVaults : inactiveVaults).map(
              (vault) => (
                <VaultTableRow key={vault.id} vault={vault} />
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {activeTab === "active" && activeVaults.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Active Vaults
          </h3>
          <p className="text-gray-500">Launch a vault to see it here</p>
        </div>
      )}

      {activeTab === "inactive" && inactiveVaults.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No Inactive Vaults
          </h3>
          <p className="text-gray-500">All vaults are currently active</p>
        </div>
      )}
    </div>
  );
}
