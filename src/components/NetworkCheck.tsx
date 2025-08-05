import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import { SUPPORTED_NETWORKS } from "./Navbar";

interface NetworkCheckProps {
  requiredChainId?: number;
  children: React.ReactNode;
}

export function NetworkCheck({
  requiredChainId = 8453,
  children,
}: NetworkCheckProps) {
  const { account, chainId } = useWallet();
  const { switchChain, isPending } = useSwitchChain();
  const [showPrompt, setShowPrompt] = useState(false);

  const requiredNetwork =
    SUPPORTED_NETWORKS[requiredChainId as keyof typeof SUPPORTED_NETWORKS];

  useEffect(() => {
    if (account && chainId !== requiredChainId) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [account, chainId, requiredChainId]);

  const handleSwitchNetwork = async () => {
    if (switchChain) {
      try {
        await switchChain({ chainId: requiredChainId });
      } catch (error) {
        console.error("Failed to switch network:", error);
      }
    }
  };

  if (!account) {
    return <div>{children}</div>;
  }

  if (showPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div className="text-center">
            <div className="text-2xl mb-4">🔵</div>
            <h2 className="text-xl font-bold mb-2">Switch to Base Network</h2>
            <p className="text-gray-600 mb-6">
              This page requires you to be connected to the Base network to
              function properly.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleSwitchNetwork}
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isPending
                  ? "Switching..."
                  : `Switch to ${requiredNetwork?.name}`}
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}
