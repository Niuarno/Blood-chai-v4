"use client";

import { motion } from "framer-motion";
import { Award, Star, Gift, Trophy, Medal, Crown, FileText } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const rewardLevels = [
  {
    level: "Bronze Donor",
    donations: 1,
    points: 10,
    icon: Medal,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    benefits: ["Recognition on platform", "Priority notifications for blood needs"],
  },
  {
    level: "Silver Donor",
    donations: 3,
    points: 30,
    icon: Award,
    color: "text-gray-400",
    bgColor: "bg-gray-100",
    benefits: ["All Bronze benefits", "Special badge on profile", "Certificate of appreciation"],
  },
  {
    level: "Gold Donor",
    donations: 5,
    points: 50,
    icon: Trophy,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    benefits: ["All Silver benefits", "Priority blood access for family", "Annual recognition event"],
  },
  {
    level: "Platinum Donor",
    donations: 10,
    points: 100,
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    benefits: ["All Gold benefits", "Lifetime achievement badge", "Special gifts from partners"],
  },
];

const pointEarningRules = [
  { action: "Successful blood donation", points: 10, note: "Base points for each donation" },
  { action: "Emergency donation (critical cases)", points: 15, note: "Bonus for urgent needs" },
  { action: "Referring a new donor", points: 5, note: "After referred donor's first donation" },
  { action: "Completing profile", points: 5, note: "One-time bonus" },
  { action: "Maintaining availability", points: 2, note: "Monthly bonus for active status" },
];

const rewardRules = [
  "Points are awarded after successful donation confirmation by recipient or admin",
  "Points cannot be transferred between accounts",
  "Rewards and gifts are distributed during annual events",
  "Admin reserves the right to adjust points for special contributions",
  "Fraudulent activities will result in point deduction and account suspension",
  "Points are non-monetary and have no cash value",
  "Donors can track their points from their dashboard",
  "Special campaigns may offer bonus points",
];

export default function RewardRulesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Award className="h-12 w-12 mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Reward System Rules</h1>
              <p className="text-amber-100 max-w-2xl mx-auto">
                Learn how to earn points and unlock rewards for your life-saving donations
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* How Points Work */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    How Points Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Action</th>
                          <th className="text-center py-3 px-4">Points</th>
                          <th className="text-left py-3 px-4">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pointEarningRules.map((rule, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 px-4">{rule.action}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge className="bg-amber-100 text-amber-700">+{rule.points}</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{rule.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Reward Levels */}
              <h2 className="text-2xl font-bold mb-6">Donor Recognition Levels</h2>
              <div className="grid gap-6 mb-8">
                {rewardLevels.map((level, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className={`p-6 flex items-center justify-center ${level.bgColor}`}>
                          <level.icon className={`h-16 w-16 ${level.color}`} />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{level.level}</h3>
                            <Badge variant="outline">{level.donations}+ donations</Badge>
                          </div>
                          <p className="text-amber-600 font-medium mb-3">{level.points} total points</p>
                          <div className="space-y-1">
                            {level.benefits.map((benefit, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                <Gift className="h-4 w-4 text-green-500" />
                                <span>{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Rules */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Rules & Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {rewardRules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-amber-700 font-medium">{index + 1}</span>
                        </div>
                        <span className="text-gray-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Special Recognition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Special Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Top donors are recognized annually during our Blood Donation Day events. 
                    Special awards include:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-medium text-amber-800">Donor of the Year</h4>
                      <p className="text-sm text-amber-700">Highest donations in a calendar year</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800">Life Saver Award</h4>
                      <p className="text-sm text-blue-700">For emergency response donations</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">Community Hero</h4>
                      <p className="text-sm text-green-700">Outstanding community engagement</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800">Youth Ambassador</h4>
                      <p className="text-sm text-purple-700">For donors under 25 with 5+ donations</p>
                    </div>
                  </div>
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
