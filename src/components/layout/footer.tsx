"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Droplets, Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

interface FooterConfig {
  description: string;
  facebook: string;
  twitter: string;
  instagram: string;
  address: string;
  phone: string;
  email: string;
}

const defaultConfig: FooterConfig = {
  description: "A life-saving blood donation platform dedicated to connecting donors with those in need across Bangladesh.",
  facebook: "#",
  twitter: "#",
  instagram: "#",
  address: "Dhaka, Bangladesh",
  phone: "+880 1234-567890",
  email: "contact@bloodchai.org",
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [config, setConfig] = useState<FooterConfig>(defaultConfig);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/site-config?key=footer");
        const data = await res.json();
        if (data.config) {
          setConfig({ ...defaultConfig, ...data.config });
        }
      } catch (error) {
        console.error("Failed to fetch footer config:", error);
      }
    };
    
    fetchConfig();
  }, []);

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Droplets className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold">BloodChai</span>
            </Link>
            <p className="text-gray-400 text-sm">
              {config.description}
            </p>
            <div className="flex gap-4">
              <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href={config.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={config.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/find-blood" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Find Blood
                </Link>
              </li>
              <li>
                <Link href="/blood-banks" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Blood Banks
                </Link>
              </li>
              <li>
                <Link href="/become-donor" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Become a Donor
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Donate Money
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Emergency Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Rules & Info */}
          <div>
            <h3 className="font-semibold mb-4">Rules & Information</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rulebook" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Blood Donation Rules
                </Link>
              </li>
              <li>
                <Link href="/rulebook/rewards" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Reward System Rules
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                <span>{config.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 flex-shrink-0 text-red-500" />
                <span>{config.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 flex-shrink-0 text-red-500" />
                <span>{config.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} BloodChai. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> for Bangladesh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
