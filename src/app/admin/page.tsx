"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-session";
import {
  Droplets,
  Users,
  Heart,
  AlertTriangle,
  Bell,
  Settings,
  LogOut,
  Loader2,
  Shield,
  Check,
  X,
  Eye,
  Banknote,
  Award,
  Calendar,
  MessageSquareWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { formatRelativeTime, divisions, bloodGroups } from "@/lib/utils";

interface DashboardStats {
  totalDonors: number;
  totalRecipients: number;
  totalRequests: number;
  pendingRequests: number;
  emergencyRequests: number;
  totalDonations: number;
}

interface Donor {
  id: string;
  bloodGroup: string;
  division: string;
  district: string;
  isAvailable: boolean;
  totalDonations: number;
  points: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  reports: { id: string }[];
}

interface Recipient {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

interface BloodRequest {
  id: string;
  bloodGroup: string;
  patientName: string;
  hospitalName: string;
  contactNumber: string;
  urgency: string;
  status: string;
  isEmergency: boolean;
  createdAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  donor: {
    id: string;
    user: {
      name: string;
    };
  } | null;
}

interface EmergencyCallout {
  id: string;
  bloodGroup: string;
  location: string;
  hospitalName: string;
  contactNumber: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedDonor: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}

interface PaymentConfig {
  id: string;
  method: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  isActive: boolean;
}

interface FooterConfig {
  description: string;
  facebook: string;
  twitter: string;
  instagram: string;
  address: string;
  phone: string;
  email: string;
}

export default function AdminDashboard() {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  
  // Data states with defaults
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [emergencyCallouts, setEmergencyCallouts] = useState<EmergencyCallout[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    description: "A life-saving blood donation platform dedicated to connecting donors with those in need across Bangladesh.",
    facebook: "",
    twitter: "",
    instagram: "",
    address: "Dhaka, Bangladesh",
    phone: "+880 1234-567890",
    email: "contact@bloodchai.org",
  });
  
  // Filter states - using undefined for better Select handling
  const [donorFilter, setDonorFilter] = useState({ division: "all", bloodGroup: "all", search: "" });
  const [requestFilter, setRequestFilter] = useState({ status: "all", urgency: "all" });
  
  // Edit states
  const [editingPayment, setEditingPayment] = useState<PaymentConfig | null>(null);
  const [newNotice, setNewNotice] = useState({ title: "", content: "", type: "general", targetAudience: "all" });
  const [editingPoints, setEditingPoints] = useState<{ donorId: string; points: number } | null>(null);
  
  // Modal states
  const [showDonorDetails, setShowDonorDetails] = useState<Donor | null>(null);

  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated
    // Wait for loading to complete and check multiple times to avoid false redirects
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/");
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin]);

  const fetchAllData = async () => {
    setIsLoadingData(true);
    setError(null);
    
    // Fetch each independently to prevent one failure from crashing everything
    await Promise.allSettled([
      fetchStats(),
      fetchDonors(),
      fetchRecipients(),
      fetchRequests(),
      fetchEmergencyCallouts(),
      fetchNotices(),
      fetchReports(),
      fetchPaymentConfigs(),
      fetchFooterConfig(),
    ]);
    
    setIsLoadingData(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) return;
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchDonors = async () => {
    try {
      const res = await fetch("/api/admin/donors");
      if (!res.ok) return;
      const data = await res.json();
      if (data.donors) setDonors(data.donors);
    } catch (error) {
      console.error("Failed to fetch donors:", error);
    }
  };

  const fetchRecipients = async () => {
    try {
      const res = await fetch("/api/admin/recipients");
      if (!res.ok) return;
      const data = await res.json();
      if (data.recipients) setRecipients(data.recipients);
    } catch (error) {
      console.error("Failed to fetch recipients:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      if (!res.ok) return;
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  const fetchEmergencyCallouts = async () => {
    try {
      const res = await fetch("/api/admin/emergency");
      if (!res.ok) return;
      const data = await res.json();
      if (data.callouts) setEmergencyCallouts(data.callouts);
    } catch (error) {
      console.error("Failed to fetch emergency callouts:", error);
    }
  };

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/admin/notices");
      if (!res.ok) return;
      const data = await res.json();
      if (data.notices) setNotices(data.notices);
    } catch (error) {
      console.error("Failed to fetch notices:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) return;
      const data = await res.json();
      if (data.reports) setReports(data.reports);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const fetchPaymentConfigs = async () => {
    try {
      const res = await fetch("/api/admin/payment-config");
      if (!res.ok) return;
      const data = await res.json();
      if (data.configs) setPaymentConfigs(data.configs);
    } catch (error) {
      console.error("Failed to fetch payment configs:", error);
    }
  };

  const fetchFooterConfig = async () => {
    try {
      const res = await fetch("/api/site-config?key=footer");
      if (!res.ok) return;
      const data = await res.json();
      if (data.config) {
        setFooterConfig(data.config);
      }
    } catch (error) {
      console.error("Failed to fetch footer config:", error);
    }
  };

  const handleUpdateFooterConfig = async () => {
    try {
      const res = await fetch("/api/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "footer", value: footerConfig }),
      });
      
      if (res.ok) {
        toast.success("Footer configuration updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update footer configuration");
    }
  };

  // Filter functions - with null safety
  const filteredDonors = donors.filter((d) => {
    if (!d) return false;
    if (donorFilter.division && donorFilter.division !== "all" && d.division !== donorFilter.division) return false;
    if (donorFilter.bloodGroup && donorFilter.bloodGroup !== "all" && d.bloodGroup !== donorFilter.bloodGroup) return false;
    if (donorFilter.search) {
      const search = donorFilter.search.toLowerCase();
      return (
        d.user?.name?.toLowerCase().includes(search) ||
        d.user?.email?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const filteredRequests = requests.filter((r) => {
    if (!r) return false;
    if (requestFilter.status && requestFilter.status !== "all" && r.status !== requestFilter.status) return false;
    if (requestFilter.urgency && requestFilter.urgency !== "all" && r.urgency !== requestFilter.urgency) return false;
    return true;
  });

  // Action handlers
  const handleUpdateDonorPoints = async () => {
    if (!editingPoints) return;
    
    try {
      const res = await fetch(`/api/admin/donors/${editingPoints.donorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: editingPoints.points }),
      });
      
      if (res.ok) {
        toast.success("Points updated successfully");
        fetchDonors();
        setEditingPoints(null);
      }
    } catch (error) {
      toast.error("Failed to update points");
    }
  };

  const handleResolveEmergency = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/emergency/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      
      if (res.ok) {
        toast.success("Emergency resolved");
        fetchEmergencyCallouts();
      }
    } catch (error) {
      toast.error("Failed to resolve emergency");
    }
  };

  const handleCreateNotice = async () => {
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotice),
      });
      
      if (res.ok) {
        toast.success("Notice created successfully");
        fetchNotices();
        setNewNotice({ title: "", content: "", type: "general", targetAudience: "all" });
      }
    } catch (error) {
      toast.error("Failed to create notice");
    }
  };

  const handleUpdatePaymentConfig = async () => {
    if (!editingPayment) return;
    
    try {
      const res = await fetch(`/api/admin/payment-config/${editingPayment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPayment),
      });
      
      if (res.ok) {
        toast.success("Payment config updated");
        fetchPaymentConfigs();
        setEditingPayment(null);
      }
    } catch (error) {
      toast.error("Failed to update payment config");
    }
  };

  const handleUpdateReportStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        toast.success("Report status updated");
        fetchReports();
      }
    } catch (error) {
      toast.error("Failed to update report");
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <Droplets className="h-8 w-8 text-red-500" />
          <span className="text-xl font-bold">BloodChai</span>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === "overview" ? "bg-red-500" : "hover:bg-gray-800"}`}
          >
            <Shield className="h-5 w-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === "users" ? "bg-red-500" : "hover:bg-gray-800"}`}
          >
            <Users className="h-5 w-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === "requests" ? "bg-red-500" : "hover:bg-gray-800"}`}
          >
            <Heart className="h-5 w-5" />
            Blood Requests
          </button>
          <button
            onClick={() => setActiveTab("emergency")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === "emergency" ? "bg-red-500" : "hover:bg-gray-800"}`}
          >
            <AlertTriangle className="h-5 w-5" />
            Emergency
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === "reports" ? "bg-red-500" : "hover:bg-gray-800"}`}
          >
            <MessageSquareWarning className="h-5 w-5" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab("notices")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === "notices" ? "bg-red-500" : "hover:bg-gray-800"}`}
          >
            <Bell className="h-5 w-5" />
            Notices
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === "payments" ? "bg-red-500" : "hover:bg-gray-800"}`}
          >
            <Banknote className="h-5 w-5" />
            Payments
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${activeTab === "settings" ? "bg-red-500" : "hover:bg-gray-800"}`}
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="ghost" className="w-full text-gray-400 hover:text-white" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-red-500" />
              <span className="font-bold">Admin Panel</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
              <Button size="sm" variant="outline" className="ml-4" onClick={fetchAllData}>
                Retry
              </Button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.totalDonors || 0}</p>
                        <p className="text-sm text-gray-500">Total Donors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.totalRecipients || 0}</p>
                        <p className="text-sm text-gray-500">Recipients</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.pendingRequests || 0}</p>
                        <p className="text-sm text-gray-500">Pending Requests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats?.totalDonations || 0}</p>
                        <p className="text-sm text-gray-500">Total Donations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Emergency Alerts */}
              {emergencyCallouts.filter(e => e.status === "active").length > 0 && (
                <Card className="mb-6 border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Active Emergency Callouts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {emergencyCallouts.filter(e => e.status === "active").map((callout) => (
                      <div key={callout.id} className="p-3 bg-white rounded-lg mb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant="destructive">{callout.bloodGroup}</Badge>
                            <p className="font-medium mt-1">{callout.hospitalName}</p>
                            <p className="text-sm text-gray-600">{callout.location}</p>
                            <p className="text-sm text-red-600">{callout.contactNumber}</p>
                          </div>
                          <Button size="sm" onClick={() => handleResolveEmergency(callout.id)}>
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recent Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Blood Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {requests.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No blood requests yet</p>
                  ) : (
                    <ScrollArea className="h-[300px]">
                      {requests.slice(0, 10).map((req) => (
                        <div key={req.id} className="p-3 border-b last:border-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{req.bloodGroup}</Badge>
                                <Badge variant={req.status === "pending" ? "secondary" : req.status === "accepted" ? "default" : "destructive"}>
                                  {req.status}
                                </Badge>
                                {req.isEmergency && <Badge variant="destructive">Emergency</Badge>}
                              </div>
                              <p className="font-medium mt-1">{req.patientName}</p>
                              <p className="text-sm text-gray-500">{req.hospitalName}</p>
                            </div>
                            <p className="text-xs text-gray-400">{formatRelativeTime(req.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-6">User Management</h1>
              
              <Tabs defaultValue="donors">
                <TabsList className="mb-4">
                  <TabsTrigger value="donors">Donors ({donors.length})</TabsTrigger>
                  <TabsTrigger value="recipients">Recipients ({recipients.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="donors">
                  {/* Donor Filters */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <Input
                      placeholder="Search donors..."
                      value={donorFilter.search}
                      onChange={(e) => setDonorFilter({ ...donorFilter, search: e.target.value })}
                      className="w-64"
                    />
                    <Select value={donorFilter.division} onValueChange={(v) => setDonorFilter({ ...donorFilter, division: v })}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Division" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {divisions.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={donorFilter.bloodGroup} onValueChange={(v) => setDonorFilter({ ...donorFilter, bloodGroup: v })}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Blood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {bloodGroups.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      {donors.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No donors registered yet</p>
                      ) : (
                        <ScrollArea className="h-[500px]">
                          <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="text-left p-4">Name</th>
                                <th className="text-left p-4 hidden md:table-cell">Blood</th>
                                <th className="text-left p-4 hidden lg:table-cell">Location</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Points</th>
                                <th className="text-left p-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDonors.map((donor) => (
                                <tr key={donor.id} className="border-t hover:bg-gray-50">
                                  <td className="p-4">
                                    <div>
                                      <p className="font-medium">{donor.user?.name || "N/A"}</p>
                                      <p className="text-sm text-gray-500">{donor.user?.email || "N/A"}</p>
                                      <p className="text-xs text-gray-400">{donor.user?.phone || "N/A"}</p>
                                    </div>
                                  </td>
                                  <td className="p-4 hidden md:table-cell">
                                    <Badge variant="outline">{donor.bloodGroup}</Badge>
                                  </td>
                                  <td className="p-4 hidden lg:table-cell">
                                    <p className="text-sm">{donor.district}</p>
                                    <p className="text-xs text-gray-500">{donor.division}</p>
                                  </td>
                                  <td className="p-4">
                                    <Badge variant={donor.isAvailable ? "default" : "secondary"} className={donor.isAvailable ? "bg-green-500" : ""}>
                                      {donor.isAvailable ? "Available" : "Unavailable"}
                                    </Badge>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <Award className="h-4 w-4 text-amber-500" />
                                      <span>{donor.points}</span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" onClick={() => setShowDonorDetails(donor)}>
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recipients">
                  <Card>
                    <CardContent className="p-0">
                      {recipients.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No recipients registered yet</p>
                      ) : (
                        <ScrollArea className="h-[500px]">
                          <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="text-left p-4">Name</th>
                                <th className="text-left p-4 hidden md:table-cell">Email</th>
                                <th className="text-left p-4 hidden lg:table-cell">Phone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recipients.map((recipient) => (
                                <tr key={recipient.id} className="border-t hover:bg-gray-50">
                                  <td className="p-4 font-medium">{recipient.user?.name || "N/A"}</td>
                                  <td className="p-4 hidden md:table-cell">{recipient.user?.email || "N/A"}</td>
                                  <td className="p-4 hidden lg:table-cell">{recipient.user?.phone || "N/A"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-6">Blood Requests Management</h1>
              
              <div className="flex gap-4 mb-4">
                <Select value={requestFilter.status} onValueChange={(v) => setRequestFilter({ ...requestFilter, status: v })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={requestFilter.urgency} onValueChange={(v) => setRequestFilter({ ...requestFilter, urgency: v })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  {requests.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No blood requests yet</p>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      {filteredRequests.map((req) => (
                        <div key={req.id} className="p-4 border-b hover:bg-gray-50">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{req.bloodGroup}</Badge>
                                <Badge variant={req.status === "pending" ? "secondary" : req.status === "accepted" ? "default" : "destructive"}>
                                  {req.status}
                                </Badge>
                                <Badge variant={req.urgency === "critical" ? "destructive" : "secondary"}>
                                  {req.urgency}
                                </Badge>
                              </div>
                              
                              <h3 className="font-medium">{req.patientName}</h3>
                              <p className="text-sm text-gray-600">{req.hospitalName}</p>
                              <p className="text-sm text-gray-500">Contact: {req.contactNumber}</p>
                              
                              {req.donor && (
                                <p className="text-sm text-green-600 mt-1">
                                  Donor: {req.donor.user?.name || "N/A"}
                                </p>
                              )}
                              
                              <p className="text-xs text-gray-400 mt-2">
                                Requester: {req.requester?.name || "N/A"} ({req.requester?.email || "N/A"})
                              </p>
                            </div>
                            
                            <p className="text-sm text-gray-500">{formatRelativeTime(req.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Emergency Tab */}
          {activeTab === "emergency" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-6">Emergency Callouts</h1>
              
              <div className="grid gap-4">
                {emergencyCallouts.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No emergency callouts
                    </CardContent>
                  </Card>
                ) : (
                  emergencyCallouts.map((callout) => (
                    <Card key={callout.id} className={callout.status === "active" ? "border-red-200" : ""}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="destructive">{callout.bloodGroup}</Badge>
                              <Badge variant={callout.status === "active" ? "destructive" : "secondary"}>
                                {callout.status}
                              </Badge>
                            </div>
                            <h3 className="font-semibold">{callout.hospitalName}</h3>
                            <p className="text-sm text-gray-600">{callout.location}</p>
                            <p className="text-sm text-red-600 font-medium">{callout.contactNumber}</p>
                            {callout.description && (
                              <p className="text-sm text-gray-500 mt-2">{callout.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(callout.createdAt)}</p>
                          </div>
                          
                          {callout.status === "active" && (
                            <Button onClick={() => handleResolveEmergency(callout.id)}>
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-6">Donor Reports</h1>
              
              <div className="grid gap-4">
                {reports.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No reports submitted
                    </CardContent>
                  </Card>
                ) : (
                  reports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={report.status === "pending" ? "destructive" : "secondary"}>
                                {report.status}
                              </Badge>
                            </div>
                            
                            <p className="font-medium">Reason: {report.reason}</p>
                            {report.description && (
                              <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                            )}
                            
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm"><strong>Reported Donor:</strong> {report.reportedDonor?.user?.name || "N/A"}</p>
                              <p className="text-sm text-gray-500">{report.reportedDonor?.user?.email || "N/A"}</p>
                            </div>
                            
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm"><strong>Reported By:</strong> {report.reporter?.name || "N/A"}</p>
                              <p className="text-sm text-gray-500">{report.reporter?.email || "N/A"}</p>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(report.createdAt)}</p>
                          </div>
                          
                          {report.status === "pending" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleUpdateReportStatus(report.id, "reviewed")}>
                                Review
                              </Button>
                              <Button size="sm" onClick={() => handleUpdateReportStatus(report.id, "resolved")}>
                                Resolve
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Notices Tab */}
          {activeTab === "notices" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-6">Notice Board Management</h1>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Create New Notice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={newNotice.title}
                          onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                          placeholder="Notice title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={newNotice.type} onValueChange={(v) => setNewNotice({ ...newNotice, type: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select value={newNotice.targetAudience} onValueChange={(v) => setNewNotice({ ...newNotice, targetAudience: v })}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="donors">Donors Only</SelectItem>
                          <SelectItem value="recipients">Recipients Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={newNotice.content}
                        onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                        placeholder="Notice content..."
                        rows={4}
                      />
                    </div>
                    
                    <Button onClick={handleCreateNotice} disabled={!newNotice.title || !newNotice.content}>
                      Create Notice
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Notices</CardTitle>
                </CardHeader>
                <CardContent>
                  {notices.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No notices created yet</p>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      {notices.map((notice) => (
                        <div key={notice.id} className="p-4 border-b last:border-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={notice.type === "emergency" ? "destructive" : "secondary"}>
                                  {notice.type}
                                </Badge>
                                <Badge variant="outline">{notice.targetAudience}</Badge>
                                {notice.isPinned && <Badge>Pinned</Badge>}
                              </div>
                              <h3 className="font-medium">{notice.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                await fetch(`/api/admin/notices/${notice.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isActive: !notice.isActive }),
                                });
                                fetchNotices();
                              }}
                            >
                              {notice.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === "payments" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-6">Payment Configuration</h1>
              
              {paymentConfigs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    No payment configurations found. Visit /api/seed to set up defaults.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {paymentConfigs.map((config) => (
                    <Card key={config.id}>
                      <CardHeader>
                        <CardTitle className="capitalize">{config.method}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editingPayment?.id === config.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Account Name</Label>
                                <Input
                                  value={editingPayment.accountName}
                                  onChange={(e) => setEditingPayment({ ...editingPayment, accountName: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Account Number</Label>
                                <Input
                                  value={editingPayment.accountNumber}
                                  onChange={(e) => setEditingPayment({ ...editingPayment, accountNumber: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Instructions</Label>
                              <Textarea
                                value={editingPayment.instructions}
                                onChange={(e) => setEditingPayment({ ...editingPayment, instructions: e.target.value })}
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleUpdatePaymentConfig}>Save</Button>
                              <Button variant="outline" onClick={() => setEditingPayment(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-500">Account Name</p>
                                <p className="font-medium">{config.accountName}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Account Number</p>
                                <p className="font-medium">{config.accountNumber}</p>
                              </div>
                            </div>
                            <div className="mb-4">
                              <p className="text-sm text-gray-500">Instructions</p>
                              <p className="text-sm whitespace-pre-line">{config.instructions}</p>
                            </div>
                            <Button variant="outline" onClick={() => setEditingPayment(config)}>
                              Edit Configuration
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
              
              <Card>
                <CardHeader>
                  <CardTitle>Footer Configuration</CardTitle>
                  <CardDescription>Update the footer information displayed on the website</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={footerConfig.description}
                        onChange={(e) => setFooterConfig({ ...footerConfig, description: e.target.value })}
                        placeholder="About your platform..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input
                          value={footerConfig.address}
                          onChange={(e) => setFooterConfig({ ...footerConfig, address: e.target.value })}
                          placeholder="Dhaka, Bangladesh"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={footerConfig.phone}
                          onChange={(e) => setFooterConfig({ ...footerConfig, phone: e.target.value })}
                          placeholder="+880 1234-567890"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={footerConfig.email}
                        onChange={(e) => setFooterConfig({ ...footerConfig, email: e.target.value })}
                        placeholder="contact@bloodchai.org"
                      />
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">Social Media Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Facebook URL</Label>
                          <Input
                            value={footerConfig.facebook}
                            onChange={(e) => setFooterConfig({ ...footerConfig, facebook: e.target.value })}
                            placeholder="https://facebook.com/bloodchai"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Twitter URL</Label>
                          <Input
                            value={footerConfig.twitter}
                            onChange={(e) => setFooterConfig({ ...footerConfig, twitter: e.target.value })}
                            placeholder="https://twitter.com/bloodchai"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Instagram URL</Label>
                          <Input
                            value={footerConfig.instagram}
                            onChange={(e) => setFooterConfig({ ...footerConfig, instagram: e.target.value })}
                            placeholder="https://instagram.com/bloodchai"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={handleUpdateFooterConfig} className="bg-red-500 hover:bg-red-600">
                      Save Footer Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>

      {/* Donor Details Modal */}
      {showDonorDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Donor Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDonorDetails(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{showDonorDetails.user?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{showDonorDetails.user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{showDonorDetails.user?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blood Group</p>
                  <Badge variant="outline">{showDonorDetails.bloodGroup}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{showDonorDetails.district}, {showDonorDetails.division}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Donations</p>
                  <p className="font-medium">{showDonorDetails.totalDonations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reward Points</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editingPoints?.donorId === showDonorDetails.id ? editingPoints.points : showDonorDetails.points}
                      onChange={(e) => setEditingPoints({ donorId: showDonorDetails.id, points: parseInt(e.target.value) || 0 })}
                      className="w-24"
                    />
                    <Button size="sm" onClick={handleUpdateDonorPoints}>Update</Button>
                  </div>
                </div>
                {showDonorDetails.reports?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Reports Against Donor</p>
                    <p className="text-red-500 font-medium">{showDonorDetails.reports.length} report(s)</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">
        <Button variant="ghost" size="sm" onClick={() => setActiveTab("overview")}>
          <Shield className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setActiveTab("users")}>
          <Users className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setActiveTab("requests")}>
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setActiveTab("emergency")}>
          <AlertTriangle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setActiveTab("settings")}>
          <Settings className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
