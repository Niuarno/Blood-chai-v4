import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to relative time (e.g., "5 days ago")
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  
  const donationDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - donationDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

// Format date to readable string
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Bangladesh divisions
export const divisions = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

// Bangladesh districts by division
export const districtsByDivision: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],
  Chittagong: [
    "Chittagong",
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Comilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],
  Rajshahi: [
    "Rajshahi",
    "Bogra",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Nawabganj",
    "Pabna",
    "Sirajganj",
  ],
  Khulna: [
    "Khulna",
    "Bagerhat",
    "Chuadanga",
    "Jessore",
    "Jhenaidah",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],
  Sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
  Barisal: [
    "Barisal",
    "Barguna",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur",
  ],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
  ],
  Mymensingh: [
    "Mymensingh",
    "Jamalpur",
    "Netrokona",
    "Sherpur",
  ],
};

// Blood groups
export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Urgency levels
export const urgencyLevels = [
  { value: "critical", label: "Critical - Within 24 hours", color: "red" },
  { value: "urgent", label: "Urgent - Within 3 days", color: "orange" },
  { value: "normal", label: "Normal - Within a week", color: "green" },
];
