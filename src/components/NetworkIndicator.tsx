import { useWallet } from "@/context/WalletContext";
import { SUPPORTED_NETWORKS } from "./Navbar";

export function NetworkIndicator() {
  const { chainId } = useWallet();

  if (!chainId) return null;

  const network =
    SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS];

  if (!network) return null;

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
      <span>{network.icon}</span>
      <span className="font-medium text-gray-700">{network.name}</span>
    </div>
  );
}
