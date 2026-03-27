"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Phone, CreditCard, Building, Copy, Check, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface PaymentConfig {
  id: string;
  method: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  isActive: boolean;
}

export default function DonatePage() {
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
    transactionId: "",
    paymentMethod: "bkash",
    notes: "",
  });

  useEffect(() => {
    fetchPaymentConfigs();
  }, []);

  const fetchPaymentConfigs = async () => {
    try {
      const res = await fetch("/api/admin/payment-config");
      const data = await res.json();
      if (data.configs) {
        setPaymentConfigs(data.configs.filter((c: PaymentConfig) => c.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch payment configs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyNumber = async (number: string) => {
    await navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    setTimeout(() => setCopiedNumber(null), 2000);
    toast.success("Account number copied!");
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/donations/money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Thank you for your donation! We'll verify and confirm shortly.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          amount: "",
          transactionId: "",
          paymentMethod: "bkash",
          notes: "",
        });
      } else {
        toast.error(data.error || "Failed to submit donation");
      }
    } catch (error) {
      toast.error("Failed to submit donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentConfig = (method: string) => {
    return paymentConfigs.find((c) => c.method === method);
  };

  const defaultConfigs: Record<string, PaymentConfig> = {
    bkash: {
      id: "default-bkash",
      method: "bkash",
      accountName: "BloodChai Foundation",
      accountNumber: "01712345678",
      instructions: "1. Open your bKash app\n2. Select 'Send Money'\n3. Enter the number: 01712345678\n4. Enter the amount\n5. Add reference: 'Donation'\n6. Confirm with your PIN",
      isActive: true,
    },
    nagad: {
      id: "default-nagad",
      method: "nagad",
      accountName: "BloodChai Foundation",
      accountNumber: "01812345678",
      instructions: "1. Open your Nagad app\n2. Select 'Send Money'\n3. Enter the number: 01812345678\n4. Enter the amount\n5. Add reference: 'Donation'\n6. Confirm with your PIN",
      isActive: true,
    },
    bank: {
      id: "default-bank",
      method: "bank",
      accountName: "BloodChai Foundation",
      accountNumber: "1234567890",
      instructions: "Bank Name: Dutch Bangla Bank\nBranch: Dhanmondi, Dhaka\nAccount Type: Savings\n\nFor international transfers:\nSWIFT Code: DBBLBDDH\nRouting Number: 123456789",
      isActive: true,
    },
  };

  const bkashConfig = getPaymentConfig("bkash") || defaultConfigs.bkash;
  const nagadConfig = getPaymentConfig("nagad") || defaultConfigs.nagad;
  const bankConfig = getPaymentConfig("bank") || defaultConfigs.bank;

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
              <Heart className="h-12 w-12 mx-auto mb-4 fill-white" />
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Support Our Mission</h1>
              <p className="text-red-100 max-w-2xl mx-auto">
                Your donation helps us maintain this platform and organize blood donation campaigns across Bangladesh.
                Every contribution saves lives.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Methods */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Payment Methods</h2>
                
                <Tabs defaultValue="bkash" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="bkash" className="text-pink-600">
                      bKash
                    </TabsTrigger>
                    <TabsTrigger value="nagad" className="text-orange-600">
                      Nagad
                    </TabsTrigger>
                    <TabsTrigger value="bank" className="text-blue-600">
                      Bank
                    </TabsTrigger>
                  </TabsList>

                  {/* bKash */}
                  <TabsContent value="bkash">
                    <Card>
                      <CardHeader className="bg-pink-50 rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            b
                          </div>
                          <div>
                            <CardTitle>bKash</CardTitle>
                            <CardDescription>Send money instantly</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Account Name</p>
                            <p className="font-medium">{bkashConfig.accountName}</p>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">bKash Number</p>
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-lg">{bkashConfig.accountNumber}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyNumber(bkashConfig.accountNumber)}
                              >
                                {copiedNumber === bkashConfig.accountNumber ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Instructions</p>
                            <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-line">
                              {bkashConfig.instructions}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Nagad */}
                  <TabsContent value="nagad">
                    <Card>
                      <CardHeader className="bg-orange-50 rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            N
                          </div>
                          <div>
                            <CardTitle>Nagad</CardTitle>
                            <CardDescription>Fast mobile payment</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Account Name</p>
                            <p className="font-medium">{nagadConfig.accountName}</p>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Nagad Number</p>
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-lg">{nagadConfig.accountNumber}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyNumber(nagadConfig.accountNumber)}
                              >
                                {copiedNumber === nagadConfig.accountNumber ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Instructions</p>
                            <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-line">
                              {nagadConfig.instructions}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Bank Transfer */}
                  <TabsContent value="bank">
                    <Card>
                      <CardHeader className="bg-blue-50 rounded-t-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                            <Building className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle>Bank Transfer</CardTitle>
                            <CardDescription>Direct bank deposit</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Account Name</p>
                            <p className="font-medium">{bankConfig.accountName}</p>
                          </div>
                          
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Account Number</p>
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-lg">{bankConfig.accountNumber}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyNumber(bankConfig.accountNumber)}
                              >
                                {copiedNumber === bankConfig.accountNumber ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-2">Bank Details</p>
                            <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-line">
                              {bankConfig.instructions}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Donation Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Submit Your Donation</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Donation Information</CardTitle>
                    <CardDescription>
                      After making your payment, fill this form to let us know
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitDonation} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Full name"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+880 1XXX-XXXXXX"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount (BDT) *</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="paymentMethod">Payment Method *</Label>
                          <select
                            id="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="bank">Bank Transfer</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID *</Label>
                        <Input
                          id="transactionId"
                          value={formData.transactionId}
                          onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                          placeholder="Transaction/Reference ID"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Any message or additional information"
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4 mr-2" />
                            Submit Donation
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        Your donation will be verified and confirmed within 24 hours
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Every donation, no matter how small, contributes to our mission of saving lives through blood donation.
              Here's how your support helps:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Platform Maintenance</h3>
                  <p className="text-sm text-gray-600">
                    Keeping the platform running 24/7 for blood donation coordination
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Awareness Campaigns</h3>
                  <p className="text-sm text-gray-600">
                    Organizing blood donation camps and awareness programs
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Donor Rewards</h3>
                  <p className="text-sm text-gray-600">
                    Funding rewards and recognition for regular blood donors
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
