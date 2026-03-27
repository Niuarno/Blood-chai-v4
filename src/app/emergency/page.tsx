"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, MapPin, Droplet, Loader2, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bloodGroups, divisions, districtsByDivision } from "@/lib/utils";
import { toast } from "sonner";

export default function EmergencyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: "",
    hospitalName: "",
    location: "",
    division: "",
    district: "",
    contactNumber: "",
    patientName: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bloodGroup || !formData.hospitalName || !formData.contactNumber || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitted(true);
        toast.success("Emergency request submitted! Our team will contact you shortly.");
      } else {
        toast.error(data.error || "Failed to submit emergency request");
      }
    } catch (error) {
      toast.error("Failed to submit emergency request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDivisionChange = (value: string) => {
    setFormData({ ...formData, division: value, district: "" });
  };

  const availableDistricts = formData.division ? districtsByDivision[formData.division] || [] : [];

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Emergency Request Submitted</h1>
            <p className="text-gray-600 mb-6">
              Our team has been notified and will contact you shortly. 
              Please keep your phone available.
            </p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/find-blood")} className="w-full">
                Find Blood Donors
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                Return Home
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Emergency Blood Request</h1>
              <p className="text-red-100 max-w-2xl mx-auto">
                For critical blood needs requiring immediate attention. Our team will be notified instantly.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {/* Warning Card */}
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">This is for emergencies only</p>
                      <p className="text-sm text-red-700 mt-1">
                        Please use this form only for critical blood needs where time is crucial. 
                        For regular blood requests, please use the <a href="/find-blood" className="underline">Find Blood</a> page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-red-500" />
                    Emergency Details
                  </CardTitle>
                  <CardDescription>
                    Fill in the details below. All fields marked with * are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Blood Group */}
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group Required *</Label>
                      <Select
                        value={formData.bloodGroup}
                        onValueChange={(v) => setFormData({ ...formData, bloodGroup: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
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

                    {/* Patient Name */}
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name</Label>
                      <Input
                        id="patientName"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        placeholder="Patient's full name"
                      />
                    </div>

                    {/* Hospital */}
                    <div className="space-y-2">
                      <Label htmlFor="hospitalName">Hospital Name *</Label>
                      <Input
                        id="hospitalName"
                        value={formData.hospitalName}
                        onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                        placeholder="e.g., Dhaka Medical College Hospital"
                        required
                      />
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="division">Division</Label>
                        <Select
                          value={formData.division}
                          onValueChange={handleDivisionChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select division" />
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

                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Select
                          value={formData.district}
                          onValueChange={(v) => setFormData({ ...formData, district: v })}
                          disabled={!formData.division}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select district" />
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
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="location">Hospital Address / Location *</Label>
                      <Textarea
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Full hospital address with landmark"
                        rows={2}
                        required
                      />
                    </div>

                    {/* Contact */}
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="contactNumber"
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                          placeholder="+880 1XXX-XXXXXX"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Additional Information</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Any additional information about the emergency..."
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={isSubmitting}
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting Emergency Request...
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Submit Emergency Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-2">Need immediate assistance?</p>
                <p className="text-lg font-semibold text-red-600">
                  Call: +880 1234-567890
                </p>
                <p className="text-sm text-gray-500">Available 24/7 for emergencies</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
