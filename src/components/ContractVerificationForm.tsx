import { useState } from 'react';

interface ContractVerificationFormProps {
  onSubmit: (txHash: string) => Promise<void>;
  isLoading: boolean;
}

export function ContractVerificationForm({ onSubmit, isLoading }: ContractVerificationFormProps) {
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!txHash) {
      setError('Please enter a transaction hash');
      return;
    }

    if (!txHash.match(/^0x([A-Fa-f0-9]{64})$/)) {
      setError('Please enter a valid transaction hash');
      return;
    }

    try {
      await onSubmit(txHash);
    } catch (error: any) {
      setError(error.message || 'Failed to verify contract');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="txHash" className="block text-sm font-medium text-gray-700">
          Creation Transaction Hash
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="txHash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="0x..."
            disabled={isLoading}
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Verify Contract'}
      </button>
    </form>
  );
} 