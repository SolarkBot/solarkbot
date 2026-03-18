import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatSOL(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}

export function formatUSDC(amount: number, decimals = 6): string {
  return (amount / Math.pow(10, decimals)).toFixed(2);
}
