/*
 * Class-name composition for the in-house primitives (D-023):
 * clsx for conditional classes + tailwind-merge for conflict resolution.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class values, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs));
}
