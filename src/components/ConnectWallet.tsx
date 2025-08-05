import { useWallet } from "@/context/WalletContext";
import { SUPPORTED_CHAINS } from "@/config/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWallet() {
  const {
    account,
    chainId,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  const switchChain = async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask
        const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
        if (!chain) return;

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              nativeCurrency: {
                name: chain.name,
                symbol: chain.id === 1 ? "ETH" : "MATIC",
                decimals: 18,
              },
              rpcUrls: [
                chain.id === 1
                  ? `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
                  : `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
              ],
            },
          ],
        });
      }
    }
  };

  const getCurrentChainName = () => {
    return (
      SUPPORTED_CHAINS.find((chain) => chain.id === chainId)?.name ||
      "Unknown Network"
    );
  };

  if (!account) {
    let lablename = isConnecting ? "Connecting..." : "Connect Wallet";
    return (
      <div className="p-4 border-b">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-medium text-gray-700">
            Please connect your wallet to proceed
          </p>
          {/* <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button> */}
          {isConnecting ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <ConnectButton label={lablename} />
          )}
          {/* <ConnectButton label={lablename} /> */}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b">
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Connected Account</span>
            <span className="font-medium">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Network</span>
            <div className="flex items-center gap-2">
              <select
                value={chainId || ""}
                onChange={(e) => switchChain(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {SUPPORTED_CHAINS.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={disconnectWallet}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
