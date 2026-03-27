"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-session";
import {
  Droplets,
  User,
  Calendar,
  MapPin,
  Phone,
  Heart,
  Check,
  X,
  Clock,
  Award,
  Bell,
  Settings,
  LogOut,
  Loader2,
  Camera,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { divisions, districtsByDivision, bloodGroups, formatRelativeTime, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DonorProfile {
  id: string;
  bloodGroup: string;
  division: string;
  district: string;
  area: string;
  address: string;
  isAvailable: boolean;
  lastDonationDate: string | null;
  totalDonations: number;
  points: number;
  profileImage: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  emergencyPhone: string | null;
}

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
  requester: {
    id: string;
    name: string;
    phone: string | null;
  };
}

interface Donation {
  id: string;
  bloodGroup: string;
  recipientName: string | null;
  hospitalName: string | null;
  donationDate: string;
  pointsEarned: number;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

export default function DonorDashboard() {
  const { user, isLoading, logout, isDonor } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // Edit profile state
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    division: "",
    district: "",
    area: "",
    address: "",
    emergencyPhone: "",
    bloodGroup: "",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user && !isDonor) {
      router.push("/");
    }
  }, [user, isLoading, isDonor, router]);

  useEffect(() => {
    if (user && isDonor) {
      fetchDashboardData();
    }
  }, [user, isDonor]);

  const fetchDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch profile
      const profileRes = await fetch("/api/donors/me");
      const profileData = await profileRes.json();
      if (profileData.donor) {
        setProfile(profileData.donor);
        setEditData({
          division: profileData.donor.division,
          district: profileData.donor.district,
          area: profileData.donor.area || "",
          address: profileData.donor.address || "",
          emergencyPhone: profileData.donor.emergencyPhone || "",
          bloodGroup: profileData.donor.bloodGroup,
        });
      }

      // Fetch requests
      const requestsRes = await fetch("/api/requests");
      const requestsData = await requestsRes.json();
      if (requestsData.requests) {
        setRequests(requestsData.requests);
      }

      // Fetch donations
      const donationsRes = await fetch("/api/donors/donations");
      const donationsData = await donationsRes.json();
      if (donationsData.donations) {
        setDonations(donationsData.donations);
      }

      // Fetch notices
      const noticesRes = await fetch("/api/notices?targetAudience=donors");
      const noticesData = await noticesRes.json();
      if (noticesData.notices) {
        setNotices(noticesData.notices);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    
    try {
      const res = await fetch("/api/donors/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !profile.isAvailable }),
      });

      const data = await res.json();
      if (data.donor) {
        setProfile({ ...profile, isAvailable: data.donor.isAvailable });
        toast.success(data.donor.isAvailable ? "You are now available for donation" : "You are now unavailable for donation");
      }
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/donors/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      const data = await res.json();
      if (data.donor) {
        setProfile({ ...profile, ...data.donor } as DonorProfile);
        setEditMode(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Request accepted! Please contact the recipient.");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline", declineReason }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Request declined");
        setShowDeclineModal(false);
        setDeclineReason("");
        setSelectedRequest(null);
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to decline request");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        // Update profile with new image
        const updateRes = await fetch("/api/donors/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileImage: data.url }),
        });

        const updateData = await updateRes.json();
        if (updateData.donor) {
          setProfile({ ...profile, profileImage: data.url } as DonorProfile);
          toast.success("Profile picture updated");
        }
      }
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const acceptedRequests = requests.filter((r) => r.status === "accepted");
  const completedRequests = requests.filter((r) => r.status === "completed");

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user || !profile) {
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
                <h1 className="font-bold text-lg">Donor Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {user.name}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Notices */}
        {notices.length > 0 && (
          <div className="mb-6">
            {notices.map((notice) => (
              <Card key={notice.id} className={`mb-2 ${notice.type === "emergency" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-2">
                    {notice.type === "emergency" ? (
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                    ) : (
                      <Bell className="h-4 w-4 text-amber-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{notice.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notice.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-red-500">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">Donation History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Stats Cards */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{profile.totalDonations}</p>
                      <p className="text-sm text-gray-500">Total Donations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Award className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{profile.points}</p>
                      <p className="text-sm text-gray-500">Reward Points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="font-semibold">{profile.isAvailable ? "Available" : "Unavailable"}</p>
                        <p className="text-sm text-gray-500">Donation Status</p>
                      </div>
                    </div>
                    <Switch
                      checked={profile.isAvailable}
                      onCheckedChange={handleToggleAvailability}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Requests</CardTitle>
                  <CardDescription>Latest blood requests for you</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <p className="text-gray-500 text-sm">No pending requests</p>
                  ) : (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {pendingRequests.slice(0, 5).map((req) => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{req.patientName}</p>
                              <p className="text-xs text-gray-500">{req.hospitalName}</p>
                            </div>
                            <Badge variant={req.urgency === "critical" ? "destructive" : "secondary"}>
                              {req.urgency}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Last Donation</CardTitle>
                  <CardDescription>Your donation timeline</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-2xl font-bold">
                      {profile.lastDonationDate ? formatRelativeTime(profile.lastDonationDate) : "No donations yet"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {profile.lastDonationDate ? formatDate(profile.lastDonationDate) : "Start your donation journey today!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Requests ({pendingRequests.length})</h2>
                {pendingRequests.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No pending requests</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {pendingRequests.map((req) => (
                      <Card key={req.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant={req.urgency === "critical" ? "destructive" : req.urgency === "urgent" ? "default" : "secondary"}>
                                  {req.urgency}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {formatRelativeTime(req.createdAt)}
                                </span>
                              </div>
                              <h3 className="font-semibold">{req.patientName}</h3>
                              <p className="text-sm text-gray-600">
                                <MapPin className="h-3 w-3 inline mr-1" />
                                {req.hospitalName} - {req.hospitalAddress}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {req.contactNumber}
                              </p>
                              {req.notes && (
                                <p className="text-sm text-gray-500 mt-2 italic">"{req.notes}"</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAcceptRequest(req.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(req);
                                  setShowDeclineModal(true);
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Accepted Requests ({acceptedRequests.length})</h2>
                {acceptedRequests.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">No accepted requests</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {acceptedRequests.map((req) => (
                      <Card key={req.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge className="bg-green-500">Accepted</Badge>
                              <h3 className="font-semibold mt-2">{req.patientName}</h3>
                              <p className="text-sm text-gray-600">{req.hospitalName}</p>
                              <p className="text-sm text-gray-600">{req.contactNumber}</p>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>Waiting for completion approval</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Donation History</CardTitle>
                <CardDescription>Your complete donation records</CardDescription>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No donation history yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{formatDate(donation.donationDate)}</p>
                          <p className="text-sm text-gray-600">
                            {donation.recipientName || "Anonymous"} - {donation.hospitalName || "Unknown Hospital"}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{donation.bloodGroup}</Badge>
                          <p className="text-sm text-amber-500 mt-1">+{donation.pointsEarned} points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? "Cancel" : "Edit Profile"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editMode ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Blood Group</Label>
                          <Select
                            value={editData.bloodGroup}
                            onValueChange={(v) => setEditData({ ...editData, bloodGroup: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
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

                        <div className="space-y-2">
                          <Label>Division</Label>
                          <Select
                            value={editData.division}
                            onValueChange={(v) => setEditData({ ...editData, division: v, district: "" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
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
                          <Label>District</Label>
                          <Select
                            value={editData.district}
                            onValueChange={(v) => setEditData({ ...editData, district: v })}
                            disabled={!editData.division}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(districtsByDivision[editData.division] || []).map((dist) => (
                                <SelectItem key={dist} value={dist}>
                                  {dist}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Area</Label>
                          <Input
                            value={editData.area}
                            onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                            placeholder="Area/Neighborhood"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Full Address</Label>
                        <Textarea
                          value={editData.address}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                          placeholder="Your full address"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Emergency Phone</Label>
                        <Input
                          value={editData.emergencyPhone}
                          onChange={(e) => setEditData({ ...editData, emergencyPhone: e.target.value })}
                          placeholder="Emergency contact number"
                        />
                      </div>

                      <Button onClick={handleUpdateProfile} disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-500 text-sm">Blood Group</Label>
                          <p className="font-semibold text-lg">{profile.bloodGroup}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-sm">Gender</Label>
                          <p className="font-semibold">{profile.gender || "Not specified"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-sm">Division</Label>
                          <p className="font-semibold">{profile.division}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500 text-sm">District</Label>
                          <p className="font-semibold">{profile.district}</p>
                        </div>
                        {profile.area && (
                          <div>
                            <Label className="text-gray-500 text-sm">Area</Label>
                            <p className="font-semibold">{profile.area}</p>
                          </div>
                        )}
                        {profile.address && (
                          <div className="col-span-2">
                            <Label className="text-gray-500 text-sm">Address</Label>
                            <p className="font-semibold">{profile.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Picture Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={profile.profileImage || ""} alt={user.name} />
                      <AvatarFallback className="text-2xl bg-red-100 text-red-600">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer hover:bg-red-600">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Click camera icon to update</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Decline Modal */}
      {showDeclineModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Decline Request</CardTitle>
              <CardDescription>Please provide a reason for declining</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Optional: Reason for declining..."
                rows={3}
              />
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowDeclineModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeclineRequest(selectedRequest.id)}
                  className="flex-1"
                >
                  Decline Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
