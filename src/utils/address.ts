export function truncateAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
} 

export function formatAddress(address: string): string {
  return truncateAddress(address);
}
