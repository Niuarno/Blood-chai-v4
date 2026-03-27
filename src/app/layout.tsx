import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BloodChai - Blood Donation Platform Bangladesh",
  description: "BloodChai is a life-saving blood donation platform for Bangladesh. Connect blood donors with those in need. Donate blood, save lives.",
  keywords: ["blood donation", "Bangladesh", "donor", "blood bank", "save lives", "blood group", "emergency blood"],
  authors: [{ name: "BloodChai Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "BloodChai - Blood Donation Platform Bangladesh",
    description: "Connect blood donors with those in need across Bangladesh",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
