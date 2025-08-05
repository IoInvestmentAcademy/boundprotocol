import { useMSOVerification } from '@/hooks/useMSOVerification';
import { useContractVerification } from '@/hooks/useContractVerification';
import { truncateAddress } from '@/utils/address';
import { Spinner } from './Spinner';

interface MSOVerificationProps {
  msoAddress: string;
}

export function MSOVerification({ msoAddress }: MSOVerificationProps) {
  const verification = useMSOVerification(msoAddress);
  const contractVerification = useContractVerification(msoAddress);

  if (verification.isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center">
          <Spinner />
          <span className="ml-2 text-gray-600">Verifying MSO contract...</span>
        </div>
      </div>
    );
  }

  if (verification.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span className="ml-2 text-red-700">{verification.error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-4">
        <div className="flex items-center">
          {verification.isVerified ? (
            <div className="flex items-center text-green-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2 font-medium">MSO Contract Verified</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-2 font-medium">MSO Contract Not Verified</span>
            </div>
          )}
        </div>

        {/* Contract Implementation Verification */}
        <div className="flex items-center">
          {verification.isVerified && (
            <div className="flex items-center text-green-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 font-medium">MSO Contract Implementation Verified</span>
            </div>
          )}
        </div>

        {/* Source Code Verification Status */}
        <div className="flex items-center">
          {contractVerification.isLoading ? (
            <div className="flex items-center">
              <Spinner />
              <span className="ml-2">Verifying source code...</span>
            </div>
          ) : contractVerification.isVerified ? (
            <div className="flex items-center text-green-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 font-medium">Source Code Verified on PolygonScan</span>
              {contractVerification.scanUrl && (
                <a
                  href={contractVerification.scanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  View on PolygonScan
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 font-medium">Source Code Not Verified</span>
            </div>
          )}
        </div>

        {verification.isVerified && (
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Token Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{verification.tokenName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Token Symbol</dt>
              <dd className="mt-1 text-sm text-gray-900">{verification.tokenSymbol}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Soft Cap</dt>
              <dd className="mt-1 text-sm text-gray-900">{verification.softCap} USDC</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {truncateAddress(verification.owner || '')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Denomination Asset</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">
                {truncateAddress(verification.denominationAsset || '')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Launch Waiting Period</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {verification.launchWaitingPeriod} seconds
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
} 