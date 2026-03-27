"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Droplets,
  Search,
  Users,
  Heart,
  Shield,
  Clock,
  Phone,
  MapPin,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface Notice {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch("/api/notices?targetAudience=all&limit=3");
        const data = await res.json();
        if (data.notices) {
          setNotices(data.notices);
        }
      } catch (error) {
        console.error("Failed to fetch notices:", error);
      }
    };
    
    fetchNotices();
  }, []);

  const features = [
    {
      icon: Search,
      title: "Find Blood Donors",
      description: "Search for blood donors by location and blood group across all 64 districts of Bangladesh.",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Users,
      title: "Become a Donor",
      description: "Register as a blood donor and help save lives. Track your donation history and earn rewards.",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Shield,
      title: "Verified Blood Banks",
      description: "Access a comprehensive list of verified blood banks with contact information and operating hours.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Clock,
      title: "Emergency Response",
      description: "Quick emergency blood requests with priority handling for critical situations.",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  const stats = [
    { value: "10,000+", label: "Registered Donors" },
    { value: "5,000+", label: "Lives Saved" },
    { value: "64", label: "Districts Covered" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/5" />
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
          
          <div className="container mx-auto px-4 py-16 md:py-24">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-4 bg-red-100 text-red-600 hover:bg-red-100">
                  🇧🇩 Serving Bangladesh
                </Badge>
              </motion.div>
              
              <motion.h1
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
              >
                Donate Blood,{" "}
                <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  Save Lives
                </span>
              </motion.h1>
              
              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              >
                BloodChai connects generous blood donors with those in urgent need across Bangladesh. 
                Your single donation can save up to three lives.
              </motion.p>
              
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/find-blood">
                  <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 w-full sm:w-auto">
                    <Search className="mr-2 h-5 w-5" />
                    Find Blood
                  </Button>
                </Link>
                <Link href="/become-donor">
                  <Button size="lg" variant="outline" className="border-2 w-full sm:w-auto">
                    <Heart className="mr-2 h-5 w-5 text-red-500" />
                    Become a Donor
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Floating Blood Drop Animation */}
            <motion.div
              className="absolute -right-20 top-1/2 transform -translate-y-1/2 hidden lg:block"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Droplets className="w-32 h-32 text-red-200" />
            </motion.div>
          </div>
        </section>

        {/* Notice Board */}
        {notices.length > 0 && (
          <section className="py-8 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <h2 className="font-semibold text-gray-900">Notice Board</h2>
                </div>
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <Card key={notice.id} className="bg-white/80 backdrop-blur border-0 shadow-sm">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-gray-900">{notice.title}</p>
                            <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                          </div>
                          {notice.type === "emergency" && (
                            <Badge variant="destructive" className="flex-shrink-0">
                              Emergency
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="py-12 bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                  <p className="text-red-100 text-sm mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How BloodChai Helps You
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our platform provides a seamless experience for both blood donors and recipients,
                making the life-saving process easier than ever.
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm group cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-600">Simple steps to save a life</p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Search Donors",
                    description: "Find blood donors by location and blood group",
                    icon: Search,
                  },
                  {
                    step: "02",
                    title: "Send Request",
                    description: "Submit your blood request with details",
                    icon: Phone,
                  },
                  {
                    step: "03",
                    title: "Save Lives",
                    description: "Connect with donor and complete donation",
                    icon: Heart,
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="text-center relative"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4 relative">
                      <item.icon className="h-8 w-8" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    {index < 2 && (
                      <ChevronRight className="hidden md:block absolute top-6 -right-4 h-6 w-6 text-gray-300" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Save Lives?
                </h2>
                <p className="text-red-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of donors across Bangladesh who are making a difference every day.
                  Your donation can give someone another chance at life.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/become-donor">
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      Register as Donor
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/donate">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                      Support Our Mission
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-8 bg-orange-50 border-y border-orange-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Emergency Blood Needed?</p>
                  <p className="text-sm text-gray-600">Get immediate assistance for critical situations</p>
                </div>
              </div>
              <Link href="/emergency">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Phone className="mr-2 h-4 w-4" />
                  Emergency Request
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
