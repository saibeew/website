"use client";

import HeroSection from "@/components/landing/HeroSection";
import FloatingDockNav from "@/components/landing/FloatingDockNav";
import ParticleBackground from "@/components/landing/ParticleBackground";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FundamentalsSection from "@/components/landing/FundamentalsSection";
import LearningDashboardSection from "@/components/landing/LearningDashboardSection";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-x-hidden">
      <ParticleBackground />
      <FloatingDockNav />
      
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FundamentalsSection />
      <LearningDashboardSection />
      <PricingSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
