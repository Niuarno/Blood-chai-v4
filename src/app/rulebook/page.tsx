"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, AlertCircle, Check, X, Clock, Heart, Shield, Droplet } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const defaultRules = [
  {
    title: "Age Requirement",
    content: "Donors must be between 18-65 years of age. This ensures the safety of both the donor and the recipient.",
    icon: "user",
  },
  {
    title: "Weight Requirement",
    content: "Donors must weigh at least 50 kg (110 lbs). This minimum weight requirement helps ensure you have enough blood volume to donate safely.",
    icon: "scale",
  },
  {
    title: "Health Status",
    content: "You must be in good health at the time of donation. If you have a cold, flu, sore throat, or any infection, please wait until you are fully recovered.",
    icon: "heart",
  },
  {
    title: "Hemoglobin Level",
    content: "Minimum hemoglobin level of 12.5 g/dL for women and 13.0 g/dL for men. This is checked before donation with a simple finger prick test.",
    icon: "droplet",
  },
  {
    title: "Waiting Period Between Donations",
    content: "Wait at least 3 months (90 days) between whole blood donations. This allows your body to replenish the donated blood cells.",
    icon: "clock",
  },
  {
    title: "Food and Hydration",
    content: "Eat a healthy meal and drink plenty of fluids before donating. Avoid fatty foods as they can affect blood tests performed on your donation.",
    icon: "food",
  },
  {
    title: "Medications",
    content: "Some medications may temporarily defer you from donating. Inform the medical staff about any medications you are taking during the health screening.",
    icon: "pill",
  },
  {
    title: "Recent Travel",
    content: "Recent travel to certain countries may result in a temporary deferral. Inform staff about any recent international travel.",
    icon: "plane",
  },
  {
    title: "Pregnancy",
    content: "Pregnant women cannot donate blood. Wait at least 6 months after giving birth before donating. Breastfeeding mothers should also wait.",
    icon: "baby",
  },
  {
    title: "Tattoos and Piercings",
    content: "Wait 6-12 months after getting a tattoo or piercing before donating blood. This waiting period ensures safety against potential infections.",
    icon: "art",
  },
];

const eligibilityChecklist = [
  { item: "I am between 18-65 years old", required: true },
  { item: "I weigh at least 50 kg", required: true },
  { item: "I am in good health today", required: true },
  { item: "I have not donated blood in the last 3 months", required: true },
  { item: "I have eaten a meal in the last 4 hours", required: false },
  { item: "I am well hydrated", required: false },
  { item: "I have valid ID proof", required: true },
  { item: "I have not had alcohol in the last 24 hours", required: false },
];

export default function RulebookPage() {
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
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Blood Donation Rules</h1>
              <p className="text-red-100 max-w-2xl mx-auto">
                Important guidelines and eligibility criteria for blood donation in Bangladesh
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Important Notice */}
              <Card className="mb-8 border-amber-200 bg-amber-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800">Important Notice</h3>
                      <p className="text-amber-700 text-sm mt-1">
                        These guidelines are for general information. Always consult with medical professionals at the blood bank for specific eligibility questions. Your safety and the safety of blood recipients is our top priority.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rules Grid */}
              <div className="grid gap-4">
                {defaultRules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <Droplet className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{rule.title}</h3>
                            <p className="text-gray-600 mt-1">{rule.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Eligibility Checklist */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Quick Eligibility Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eligibilityChecklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.required ? "bg-green-100" : "bg-gray-100"}`}>
                          {item.required ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Check className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <span className={item.required ? "text-gray-900" : "text-gray-600"}>
                          {item.item}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    * Items marked with asterisk are mandatory requirements
                  </p>
                </CardContent>
              </Card>

              {/* Benefits Section */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Benefits of Blood Donation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Free health screening with every donation",
                      "Reduced risk of heart disease",
                      "Burns calories (about 650 per donation)",
                      "Helps in maintaining iron levels",
                      "Sense of satisfaction from saving lives",
                      "Earn reward points on BloodChai",
                      "Priority access to blood during emergencies",
                      "Regular health check-ups",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pre-Donation Tips */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Tips for a Smooth Donation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Before Donation</h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• Get a good night's sleep</li>
                        <li>• Eat a healthy, low-fat meal</li>
                        <li>• Drink an extra 16 oz of water</li>
                        <li>• Avoid alcohol for 24 hours</li>
                        <li>• Bring a valid ID</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">After Donation</h4>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• Rest for 10-15 minutes</li>
                        <li>• Have snacks and fluids provided</li>
                        <li>• Avoid heavy lifting for 24 hours</li>
                        <li>• Keep the bandage on for 4 hours</li>
                        <li>• Stay hydrated for the next 24 hours</li>
                      </ul>
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
