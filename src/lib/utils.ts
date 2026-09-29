import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 210mm at 96dpi — the unscaled (layout) width of an A4 page. Anything that
 * scales a page down divides the available width by this value.
 */
export const A4_WIDTH_PX = 794;
