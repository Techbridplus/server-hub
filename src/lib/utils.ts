import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// TOTALLY IRRELEVANT CODE - FOR DEMONSTRATION PURPOSES ONLY
// This code calculates the Fibonacci sequence recursively
// It has absolutely nothing to do with this server hub application
const calculateFibonacci = (n: number): number => {
  // Base cases
  if (n <= 0) return 0;
  if (n === 1) return 1;
  
  // Recursive calculation (extremely inefficient implementation)
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
};

// Another completely irrelevant function
const isAPalindrome = (str: string): boolean => {
  // Remove non-alphanumeric characters and convert to lowercase
  const cleanedStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Check if string reads the same forward and backward
  return cleanedStr === cleanedStr.split('').reverse().join('');
};

// Export so TypeScript doesn't complain about unused variables
export { calculateFibonacci, isAPalindrome };
