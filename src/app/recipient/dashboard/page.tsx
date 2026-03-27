"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-session";
import {
  Droplets,
  Search,
  Clock,
  Check,
  X,
  Phone,
  MapPin,
  AlertTriangle,
  LogOut,
  Loader2,
  Heart,
  MessageSquareWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatRelativeTime, formatDate } from "@/lib/utils";

interface BloodRequest {
  id: string;
  bloodGroup: string;
  patientName: string;
  hospitalName: string;
  hospitalAddress: string;
  contactNumber: string;
  urgency: string;
  notes: string | null;
  status: string;
  createdAt: string;
  approvedByRecipient: boolean;
  donor: {
    id: string;
    user: {
      id: string;
      name: string;
      phone: string | null;
    };
    bloodGroup: string;
    division: string;
    district: string;
  } | null;
}

export default function RecipientDashboard() {
  const { user, isLoading, logout, isRecipient } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRequestForReport, setSelectedRequestForReport] = useState<BloodRequest | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleApproveDonation = async (requestId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedByRecipient: true }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Donation confirmed! Thank you for your feedback.");
        fetchRequests();
      }
    } catch (error) {
      toast.error("Failed to confirm donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!selectedRequestForReport || !reportReason.trim()) {
      toast.error("Please provide a reason for the report");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorId: selectedRequestForReport.donor?.id,
          requestId: selectedRequestForReport.id,
          reason: reportReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Report submitted successfully");
        setShowReportModal(false);
        setReportReason("");
        setSelectedRequestForReport(null);
      }
    } catch (error) {
      toast.error("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const completedRequests = requests.filter((r) => r.status === "completed");
  const declinedRequests = requests.filter((r) => r.status === "declined");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplets className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="font-bold text-lg">Recipient Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/find-blood")}>
                <Search className="h-4 w-4 mr-2" />
                Find Blood
              </Button>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{pendingRequests.length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{acceptedRequests.length}</p>
              <p className="text-sm text-gray-500">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-500">{completedRequests.length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-500">{declinedRequests.length}</p>
              <p className="text-sm text-gray-500">Declined</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="requests">All Requests</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>All Blood Requests</CardTitle>
                <CardDescription>Track all your blood requests</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No blood requests yet</p>
                    <Button className="mt-4" onClick={() => router.push("/find-blood")}>
                      Find Blood Donors
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req) => (
                      <Card key={req.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-4 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusBadge(req.status)}
                                  <Badge variant="outline">{req.bloodGroup}</Badge>
                                  <Badge variant={req.urgency === "critical" ? "destructive" : "secondary"}>
                                    {req.urgency}
                                  </Badge>
                                </div>
                                
                                <h3 className="font-semibold">{req.patientName}</h3>
                                <div className="text-sm text-gray-600 mt-2 space-y-1">
                                  <p className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {req.hospitalName}
                                  </p>
                                  <p className="text-gray-500 ml-6">{req.hospitalAddress}</p>
                                  <p className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {req.contactNumber}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                  Requested {formatRelativeTime(req.createdAt)}
                                </p>

                                {req.donor && req.status === "accepted" && (
                                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                    <p className="font-medium text-green-700">Donor Accepted!</p>
                                    <p className="text-sm text-green-600">Name: {req.donor.user.name}</p>
                                    <p className="text-sm text-green-600">Location: {req.donor.district}, {req.donor.division}</p>
                                    <p className="text-sm text-green-600">Phone: {req.donor.user.phone}</p>
                                  </div>
                                )}

                                {req.status === "declined" && (
                                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-600">
                                      This request was declined by the donor. Try finding another donor.
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                {req.status === "accepted" && !req.approvedByRecipient && (
                                  <Button
                                    onClick={() => handleApproveDonation(req.id)}
                                    disabled={isSubmitting}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Confirm Donation
                                  </Button>
                                )}

                                {req.status === "pending" && (
                                  <Button
                                    variant="outline"
                                    onClick={() => router.push("/find-blood")}
                                  >
                                    <Search className="h-4 w-4 mr-2" />
                                    Find Another Donor
                                  </Button>
                                )}

                                {req.donor && (req.status === "accepted" || req.status === "completed") && (
                                  <Button
                                    variant="outline"
                                    className="text-orange-500 border-orange-200"
                                    onClick={() => {
                                      setSelectedRequestForReport(req);
                                      setShowReportModal(true);
                                    }}
                                  >
                                    <MessageSquareWarning className="h-4 w-4 mr-2" />
                                    Report Donor
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Requests</CardTitle>
                <CardDescription>Requests awaiting response or completion</CardDescription>
              </CardHeader>
              <CardContent>
                {[...pendingRequests, ...acceptedRequests].length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No active requests</p>
                ) : (
                  <div className="space-y-4">
                    {[...pendingRequests, ...acceptedRequests].map((req) => (
                      <div key={req.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(req.status)}
                            <p className="font-medium mt-1">{req.patientName}</p>
                            <p className="text-sm text-gray-500">{req.hospitalName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatRelativeTime(req.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Request History</CardTitle>
                <CardDescription>Completed and declined requests</CardDescription>
              </CardHeader>
              <CardContent>
                {[...completedRequests, ...declinedRequests].length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No history yet</p>
                ) : (
                  <div className="space-y-4">
                    {[...completedRequests, ...declinedRequests].map((req) => (
                      <div key={req.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(req.status)}
                            <p className="font-medium mt-1">{req.patientName}</p>
                            <p className="text-sm text-gray-500">{req.hospitalName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(req.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Emergency Request Banner */}
        <div className="mt-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-700">Emergency Blood Needed?</h3>
                    <p className="text-sm text-red-600">Submit an emergency request for immediate attention</p>
                  </div>
                </div>
                <Button
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => router.push("/emergency")}
                >
                  Submit Emergency Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Report Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Donor</DialogTitle>
            <DialogDescription>
              Please provide details about why you want to report this donor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Explain the reason for reporting..."
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowReportModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReport}
                disabled={isSubmitting || !reportReason.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
