import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCategoryColor = (
  category: "Praise" | "Complaint" | "Recommendation",
) => {
  switch (category) {
    case "Praise":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    case "Complaint":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    case "Recommendation":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
  }
};
