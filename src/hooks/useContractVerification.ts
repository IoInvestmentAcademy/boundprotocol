import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

interface VerificationStatus {
  isVerified: boolean;
  isLoading: boolean;
  error?: string;
  scanUrl?: string;
  creationTx?: string;
}

export function useContractVerification(contractAddress: string) {
  const [status, setStatus] = useState<VerificationStatus>({
    isVerified: false,
    isLoading: true
  });

  const checkVerificationStatus = async () => {
    if (!contractAddress) return;

    try {
      const response = await axios.get(`https://api.polygonscan.com/api`, {
        params: {
          module: 'contract',
          action: 'getabi',
          address: contractAddress,
          apikey: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY
        }
      });

      if (response.data.status === '1') {
        setStatus({
          isVerified: true,
          isLoading: false,
          scanUrl: `https://polygonscan.com/address/${contractAddress}#code`
        });
      } else {
        setStatus({
          isVerified: false,
          isLoading: false,
          scanUrl: `https://polygonscan.com/address/${contractAddress}`
        });
      }
    } catch (error) {
      setStatus({
        isVerified: false,
        isLoading: false,
        error: 'Failed to check verification status'
      });
    }
  };

  const verifyWithTxHash = async (txHash: string) => {
    setStatus(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      // Store the transaction hash
      setStatus(prev => ({
        ...prev,
        creationTx: txHash,
        scanUrl: `https://polygonscan.com/tx/${txHash}`
      }));

      // Redirect to PolygonScan verification page with pre-filled data
      const verifyUrl = `https://polygonscan.com/verifyContract?a=${contractAddress}`;
      window.open(verifyUrl, '_blank');

      // Update status
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        scanUrl: `https://polygonscan.com/address/${contractAddress}`
      }));
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to process transaction hash'
      }));
    }
  };

  useEffect(() => {
    checkVerificationStatus();
  }, [contractAddress]);

  return {
    ...status,
    verifyWithTxHash,
    checkVerificationStatus
  };
} 