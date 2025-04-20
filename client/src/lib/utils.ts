import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function calculateXpProgress(xp: number): number {
  return (xp % 100) / 100;
}

export function getXpToNextLevel(xp: number): number {
  return 100 - (xp % 100);
}

export function getTotalXp(xp: number): number {
  return (calculateLevel(xp) - 1) * 100 + xp % 100;
}

export function getXpForCurrentLevel(xp: number): number {
  return xp % 100;
}

export function getXpRequiredForLevel(level: number): number {
  return level * 100;
}
