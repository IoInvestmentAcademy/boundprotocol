import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

import {
  WagmiProvider,
  useAccount,
  useDisconnect,
  useConnect,
  useWalletClient,
} from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { type WalletClient } from "viem";

const queryClient = new QueryClient();

// Wagmi configuration
const config = getDefaultConfig({
  appName: "MSO Admin",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
  wallets: [
    {
      groupName: "Popular",
      wallets: [injectedWallet, metaMaskWallet, walletConnectWallet],
    },
  ],
});

// Helper function to convert WalletClient to ethers Signer
function walletClientToSigner(walletClient: WalletClient) {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain?.id,
    name: chain?.name,
    ensAddress: chain?.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.BrowserProvider(transport, network);
  return provider.getSigner(account?.address);
}

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnecting: boolean;
  isInitializing: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletProviderInner({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use wagmi hooks
  const { address, isConnecting, chainId: chain } = useAccount();

  const { disconnectAsync } = useDisconnect();
  const { connectAsync, connectors } = useConnect();
  const { data: walletClient } = useWalletClient();

  // Update signer when wallet client changes
  useEffect(() => {
    if (walletClient) {
      const updateSigner = async () => {
        const newSigner = await walletClientToSigner(walletClient);
        setSigner(newSigner);
      };
      updateSigner();
    } else {
      setSigner(null);
    }
  }, [walletClient]);

  // Update provider when chain changes
  useEffect(() => {
    if (walletClient?.transport) {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      setProvider(provider);
    } else {
      setProvider(null);
    }
  }, [walletClient]);

  const connectWallet = async () => {
    setError(null);
    try {
      // Try to connect using the first available connector (usually injected/MetaMask)
      const connector = connectors[0];
      if (!connector) {
        throw new Error("No wallet connectors available");
      }

      await connectAsync({ connector });

      // Chain ID will be automatically handled by wagmi
      if (chain) {
        localStorage.setItem("selectedChain", chain.toString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnectAsync();
      localStorage.removeItem("selectedChain");
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account: address || null,
        chainId: chain || null,
        provider,
        signer,
        isConnecting,
        isInitializing: false, // wagmi handles initialization
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletProviderInner>{children}</WalletProviderInner>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
