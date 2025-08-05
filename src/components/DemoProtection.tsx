import { useState, useEffect } from 'react';

interface DemoProtectionProps {
  children: React.ReactNode;
}

export function DemoProtection({ children }: DemoProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const demoPasswords = [
    'msodemofoundershub',
    "enzymeuser1",
    "enzymeuser2",
    "enzymeuser3",
    "enzymeuser4",
    "iouser1",
    "iouser2",
    "iouser3",
  ]

  useEffect(() => {
    const authenticated = localStorage.getItem('demo_authenticated');

    if (authenticated === 'true') {
      setIsAuthenticated(true);
      
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isDemoMode) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_DEMO_PASSWORD || demoPasswords.includes(password)) {
      setIsAuthenticated(true);
      localStorage.setItem('demo_authenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Demo Mode Access</h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500 mb-4">
                This application is in demo mode. Please enter the password to continue.
              </p>
              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
                <button
                  type="submit"
                  className="mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Access Demo
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 