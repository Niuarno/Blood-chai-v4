"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Droplet, AlertCircle, Loader2, X, User, Mail, Lock } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { divisions, bloodGroups, urgencyLevels } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-session";
import { useRouter } from "next/navigation";

interface Donor {
  id: string;
  bloodGroup: string;
  division: string;
  district: string;
  area: string;
  isAvailable: boolean;
  lastDonationDate: string | null;
  user: {
    id: string;
    name: string;
  };
}

export default function FindBloodPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data including optional registration fields
  const [requestData, setRequestData] = useState({
    patientName: "",
    hospitalName: "",
    hospitalAddress: "",
    contactNumber: "",
    urgency: "normal",
    notes: "",
    // New user fields
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // Get available districts based on selected division
  const availableDistricts = selectedDivision 
    ? {
        Dhaka: ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
        Chittagong: ["Chittagong", "Bandarban", "Brahmanbaria", "Chandpur", "Comilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"],
        Rajshahi: ["Rajshahi", "Bogra", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna", "Sirajganj"],
        Khulna: ["Khulna", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
        Sylhet: ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
        Barisal: ["Barisal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
        Rangpur: ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon"],
        Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
      }[selectedDivision] || []
    : [];

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [selectedDivision, selectedDistrict, selectedBloodGroup, donors]);

  const fetchDonors = async () => {
    try {
      const res = await fetch("/api/donors");
      const data = await res.json();
      if (data.donors) {
        setDonors(data.donors);
        setFilteredDonors(data.donors);
      }
    } catch (error) {
      console.error("Failed to fetch donors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = [...donors];

    if (selectedDivision) {
      filtered = filtered.filter((d) => d.division === selectedDivision);
    }

    if (selectedDistrict) {
      filtered = filtered.filter((d) => d.district === selectedDistrict);
    }

    if (selectedBloodGroup) {
      filtered = filtered.filter((d) => d.bloodGroup === selectedBloodGroup);
    }

    setFilteredDonors(filtered);
  };

  const handleDivisionChange = (value: string) => {
    setSelectedDivision(value);
    setSelectedDistrict("");
  };

  const handleRequestBlood = (donor: Donor) => {
    setSelectedDonor(donor);
    // Pre-fill name and phone if user is logged in
    if (user) {
      setRequestData({
        ...requestData,
        name: user.name || "",
        phone: "",
      });
    }
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedDonor) return;
    
    // Validate required fields
    if (!requestData.patientName || !requestData.hospitalName || !requestData.contactNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    // If not logged in, require email and password
    if (!isAuthenticated && (!requestData.email || !requestData.password)) {
      toast.error("Please provide your email and create a password to register");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        donorId: selectedDonor.id,
        bloodGroup: selectedDonor.bloodGroup,
        patientName: requestData.patientName,
        hospitalName: requestData.hospitalName,
        hospitalAddress: requestData.hospitalAddress,
        contactNumber: requestData.contactNumber,
        urgency: requestData.urgency,
        notes: requestData.notes,
      };

      // Add registration fields if not logged in
      if (!isAuthenticated) {
        payload.name = requestData.name || requestData.patientName;
        payload.email = requestData.email;
        payload.password = requestData.password;
        payload.phone = requestData.contactNumber;
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      // Show success message
      if (data.isNewUser && data.credentials) {
        toast.success(
          `Account created! Your email: ${data.credentials.email}. Please save your password and login to track your request.`
        );
      } else {
        toast.success("Blood request submitted successfully!");
      }
      
      setShowRequestModal(false);
      setRequestData({
        patientName: "",
        hospitalName: "",
        hospitalAddress: "",
        contactNumber: "",
        urgency: "normal",
        notes: "",
        name: "",
        email: "",
        password: "",
        phone: "",
      });
      
      // Redirect to login or dashboard
      setTimeout(() => {
        if (!isAuthenticated) {
          router.push("/login");
        } else {
          router.push("/recipient/dashboard");
        }
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysSinceLastDonation = (date: string | null) => {
    if (!date) return null;
    const lastDonation = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDonation.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const canDonate = (donor: Donor) => {
    if (!donor.isAvailable) return false;
    const days = getDaysSinceLastDonation(donor.lastDonationDate);
    return days === null || days >= 90;
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
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Blood Donors</h1>
              <p className="text-red-100 max-w-2xl mx-auto">
                Search for available blood donors by location and blood group across Bangladesh
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-6 bg-white border-b sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
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

              <div className="w-full md:w-1/4 space-y-2">
                <Label>Blood Group</Label>
                <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Blood Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
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
                  setSelectedBloodGroup("");
                }}
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
              </div>
            ) : filteredDonors.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No donors found</h3>
                <p className="text-gray-600">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    Showing <span className="font-medium">{filteredDonors.length}</span> donors
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDonors.map((donor, index) => {
                    const canDonateNow = canDonate(donor);
                    const daysSince = getDaysSinceLastDonation(donor.lastDonationDate);

                    return (
                      <motion.div
                        key={donor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className={`h-full hover:shadow-lg transition-all duration-300 ${!canDonateNow ? 'opacity-75' : ''}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                                  {donor.bloodGroup}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{donor.user.name}</h3>
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    {donor.district}, {donor.division}
                                  </div>
                                </div>
                              </div>
                              <Badge variant={canDonateNow ? "default" : "secondary"} className={canDonateNow ? "bg-green-500" : ""}>
                                {canDonateNow ? "Available" : "Unavailable"}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                              {donor.area && (
                                <p><span className="font-medium">Area:</span> {donor.area}</p>
                              )}
                              {daysSince !== null && (
                                <p><span className="font-medium">Last donated:</span> {daysSince} days ago</p>
                              )}
                              {!canDonateNow && daysSince !== null && daysSince < 90 && (
                                <p className="text-orange-600 text-xs">
                                  Can donate again in {90 - daysSince} days
                                </p>
                              )}
                            </div>

                            <Button
                              className="w-full"
                              onClick={() => handleRequestBlood(donor)}
                              disabled={!canDonateNow}
                            >
                              <Droplet className="h-4 w-4 mr-2" />
                              Request Blood
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Request Blood Modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Blood from {selectedDonor?.user.name}</DialogTitle>
            <DialogDescription>
              {isAuthenticated 
                ? "Fill in the details below to request blood."
                : "Fill in the details below. An account will be created for you automatically."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Registration fields for non-logged in users */}
            {!isAuthenticated && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                <p className="text-sm font-medium text-blue-800">Create Your Account</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={requestData.name}
                      onChange={(e) => setRequestData({ ...requestData, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={requestData.email}
                      onChange={(e) => setRequestData({ ...requestData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={requestData.password}
                    onChange={(e) => setRequestData({ ...requestData, password: e.target.value })}
                    placeholder="Create a password"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name *</Label>
              <Input
                id="patientName"
                value={requestData.patientName}
                onChange={(e) => setRequestData({ ...requestData, patientName: e.target.value })}
                placeholder="Patient's full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name *</Label>
              <Input
                id="hospitalName"
                value={requestData.hospitalName}
                onChange={(e) => setRequestData({ ...requestData, hospitalName: e.target.value })}
                placeholder="e.g., Dhaka Medical College Hospital"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalAddress">Hospital Address *</Label>
              <Textarea
                id="hospitalAddress"
                value={requestData.hospitalAddress}
                onChange={(e) => setRequestData({ ...requestData, hospitalAddress: e.target.value })}
                placeholder="Full hospital address"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Your Contact Number *</Label>
              <Input
                id="contactNumber"
                value={requestData.contactNumber}
                onChange={(e) => setRequestData({ ...requestData, contactNumber: e.target.value })}
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level *</Label>
              <Select value={requestData.urgency} onValueChange={(v) => setRequestData({ ...requestData, urgency: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={requestData.notes}
                onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                placeholder="Any additional information for the donor"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRequestModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                disabled={isSubmitting || !requestData.patientName || !requestData.hospitalName || !requestData.contactNumber || (!isAuthenticated && (!requestData.email || !requestData.password))}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
