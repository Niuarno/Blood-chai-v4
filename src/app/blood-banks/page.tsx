"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Loader2, Search, Filter, ExternalLink } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { divisions, districtsByDivision } from "@/lib/utils";

interface BloodBank {
  id: string;
  name: string;
  division: string;
  district: string;
  address: string;
  phone: string | null;
  email: string | null;
  operatingHours: string | null;
  mapUrl: string | null;
}

export default function BloodBanksPage() {
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<BloodBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    filterBloodBanks();
  }, [selectedDivision, selectedDistrict, searchQuery, bloodBanks]);

  const fetchBloodBanks = async () => {
    try {
      const res = await fetch("/api/blood-banks");
      const data = await res.json();
      if (data.bloodBanks) {
        setBloodBanks(data.bloodBanks);
        setFilteredBanks(data.bloodBanks);
      }
    } catch (error) {
      console.error("Failed to fetch blood banks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBloodBanks = () => {
    let filtered = [...bloodBanks];

    if (selectedDivision) {
      filtered = filtered.filter((b) => b.division === selectedDivision);
    }

    if (selectedDistrict) {
      filtered = filtered.filter((b) => b.district === selectedDistrict);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.address.toLowerCase().includes(query) ||
          b.district.toLowerCase().includes(query)
      );
    }

    setFilteredBanks(filtered);
  };

  const handleDivisionChange = (value: string) => {
    setSelectedDivision(value);
    setSelectedDistrict("");
  };

  const availableDistricts = selectedDivision ? districtsByDivision[selectedDivision] || [] : [];

  // Seed initial blood banks if none exist
  useEffect(() => {
    if (bloodBanks.length === 0 && !isLoading) {
      seedBloodBanks();
    }
  }, [bloodBanks, isLoading]);

  const seedBloodBanks = async () => {
    const sampleBanks = [
      {
        name: "Dhaka Medical College Hospital Blood Bank",
        division: "Dhaka",
        district: "Dhaka",
        address: "Dhaka Medical College Hospital, Shahbag, Dhaka",
        phone: "+880 2-9661051",
        email: "info@dmch.gov.bd",
        operatingHours: "24/7",
      },
      {
        name: "Bangladesh Red Crescent Society Blood Bank",
        division: "Dhaka",
        district: "Dhaka",
        address: "National Headquarters, 684-686, Outer Circular Road, Bara Moghbazar, Dhaka",
        phone: "+880 2-9338235",
        email: "info@bdrcs.org",
        operatingHours: "Sat-Thu: 9AM-5PM",
      },
      {
        name: "Square Hospital Blood Bank",
        division: "Dhaka",
        district: "Dhaka",
        address: "18/1, West Panthapath, Dhaka",
        phone: "+880 2-8159457",
        email: "info@squarehospital.com",
        operatingHours: "24/7",
      },
      {
        name: "Chittagong Medical College Hospital Blood Bank",
        division: "Chittagong",
        district: "Chittagong",
        address: "Chittagong Medical College Hospital, Agrabad, Chittagong",
        phone: "+880 31-2542000",
        operatingHours: "24/7",
      },
      {
        name: "Rajshahi Medical College Hospital Blood Bank",
        division: "Rajshahi",
        district: "Rajshahi",
        address: "Rajshahi Medical College Hospital, Rajshahi",
        phone: "+880 721-772150",
        operatingHours: "24/7",
      },
      {
        name: "Sylhet MAG Osmani Medical College Hospital Blood Bank",
        division: "Sylhet",
        district: "Sylhet",
        address: "Sylhet MAG Osmani Medical College Hospital, Sylhet",
        phone: "+880 821-713641",
        operatingHours: "24/7",
      },
      {
        name: "Khulna Medical College Hospital Blood Bank",
        division: "Khulna",
        district: "Khulna",
        address: "Khulna Medical College Hospital, Khulna",
        phone: "+880 41-720369",
        operatingHours: "24/7",
      },
      {
        name: "Rangpur Medical College Hospital Blood Bank",
        division: "Rangpur",
        district: "Rangpur",
        address: "Rangpur Medical College Hospital, Rangpur",
        phone: "+880 521-63277",
        operatingHours: "24/7",
      },
      {
        name: "Barisal Medical College Hospital Blood Bank",
        division: "Barisal",
        district: "Barisal",
        address: "Barisal Medical College Hospital, Barisal",
        phone: "+880 431-21750",
        operatingHours: "24/7",
      },
      {
        name: "Mymensingh Medical College Hospital Blood Bank",
        division: "Mymensingh",
        district: "Mymensingh",
        address: "Mymensingh Medical College Hospital, Mymensingh",
        phone: "+880 91-62939",
        operatingHours: "24/7",
      },
    ];

    try {
      await fetch("/api/blood-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banks: sampleBanks }),
      });
      fetchBloodBanks();
    } catch (error) {
      console.error("Failed to seed blood banks:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-500 to-red-600 text-white py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Blood Banks in Bangladesh</h1>
              <p className="text-red-100 max-w-2xl mx-auto">
                Find verified blood banks across all divisions of Bangladesh with contact information and operating hours
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-6 bg-white border-b sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/4 space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search blood banks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="w-full md:w-1/4 space-y-2">
                <Label>Division</Label>
                <Select value={selectedDivision} onValueChange={handleDivisionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-1/4 space-y-2">
                <Label>District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedDivision}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((dist) => (
                      <SelectItem key={dist} value={dist}>
                        {dist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDivision("");
                  setSelectedDistrict("");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </section>

        {/* Blood Banks Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : filteredBanks.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blood banks found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Showing <span className="font-medium">{filteredBanks.length}</span> blood banks
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBanks.map((bank, index) => (
                    <motion.div
                      key={bank.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg mb-3">{bank.name}</h3>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2 text-gray-600">
                              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-500" />
                              <span>{bank.address}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4 flex-shrink-0 text-red-500 invisible" />
                              <span className="font-medium">{bank.district}, {bank.division}</span>
                            </div>
                            
                            {bank.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4 flex-shrink-0 text-red-500" />
                                <a href={`tel:${bank.phone}`} className="hover:text-red-500 transition-colors">
                                  {bank.phone}
                                </a>
                              </div>
                            )}
                            
                            {bank.email && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4 flex-shrink-0 text-red-500" />
                                <a href={`mailto:${bank.email}`} className="hover:text-red-500 transition-colors">
                                  {bank.email}
                                </a>
                              </div>
                            )}
                            
                            {bank.operatingHours && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4 flex-shrink-0 text-red-500" />
                                <span>{bank.operatingHours}</span>
                              </div>
                            )}
                          </div>

                          {bank.mapUrl && (
                            <a
                              href={bank.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-4 text-sm text-red-500 hover:text-red-600"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View on Map
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
