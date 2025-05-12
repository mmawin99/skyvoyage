import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatInTimeZone = (date: Date, timeZone: string, format: string): string => {
    const options: Intl.DateTimeFormatOptions = {
        timeZone,
        hour: format.includes("HH") ? "2-digit" : undefined,
        minute: format.includes("mm") ? "2-digit" : undefined,
        year: format.includes("yyyy") ? "numeric" : undefined,
        month: format.includes("MMM")
        ? "short"
        : format.includes("MM")
        ? "2-digit"
        : undefined,
        day: format.includes("dd") ? "2-digit" : undefined,
        hour12: false,
    };

    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
    const lookup: Record<string, string> = {};
    for (const part of parts) {
        if (part.type !== "literal") {
        lookup[part.type] = part.value;
        }
    }

    return format
        .replace("HH", lookup.hour ?? "")
        .replace("mm", lookup.minute ?? "")
        .replace("dd", lookup.day ?? "")
        .replace("MMM", lookup.month ?? "")
        .replace("MM", lookup.month ?? "")
        .replace("yyyy", lookup.year ?? "");
    }


// Define color mapping for seat classes
export const classColorMap: Record<string, string> = {
    "F": "#Cb0404", // First Class
    "C": "#f4631E", // Business Class
    "W": "#ff9f00", // Premium Economy
    "Y": "#309898"  // Economy
};

// Define class name mapping
export const classNameMap: Record<string, string> = {
    "F": "First Class",
    "C": "Business Class",
    "W": "Premium Economy",
    "Y": "Economy"
};