import { useWallet } from "@/context/WalletContext";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import { useRouter } from "next/router";
import { useToast } from "@/context/ToastContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const SUPPORTED_NETWORKS = {
  1: {
    name: "Ethereum",
    names: "ethereum",
    symbol: "ETH",
    icon: "🔷",
  },
  137: {
    name: "Polygon",
    names: "polygon",
    symbol: "MATIC",
    icon: "💜",
  },
  8453: {
    name: "Base",
    names: "base",
    symbol: "ETH",
    icon: "🔵",
  },
  // Add other networks as needed
} as const;

export function Navbar() {
  const { account, provider, chainId, disconnectWallet } = useWallet();
  const [balance, setBalance] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const isBoundV2Page = router.pathname === "/bound-v2";

  return (
    <nav
      className={`fixed w-full top-0 z-50 shadow-lg ${
        isBoundV2Page
          ? "bg-transparent"
          : "bg-gradient-to-r from-[#B62373] via-[#600678] to-[#1E0941]"
      }`}
    >
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="text-xl font-bold text-white hover:opacity-80 transition-opacity"
              >
                <img
                  src="/favicon.png"
                  alt="logo"
                  className="w-10 h-10 rounded-full shadow-md"
                />
              </Link>

              <div
                className={`text-xl font-bold ml-2 ${
                  isBoundV2Page ? "text-black" : "text-white"
                }`}
              >
                IO Investment
              </div>
            </div>
          </div>

          {/* Right side - Wallet Info */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
