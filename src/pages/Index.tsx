import { Box } from "@mui/material";
import { useRef } from "react";
import AboutSection from "@/components/AboutSection";
import BenefitsSection from "@/components/BenefitsSection";
import DemoSection from "@/components/DemoSection";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  const demoRef = useRef<HTMLDivElement>(null);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box component="main" sx={{ minHeight: "100vh", bgcolor: "transparent" }}>
      <HeroSection onScrollToDemo={scrollToDemo} />
      <Box ref={demoRef}>
        <DemoSection />
      </Box>
      <BenefitsSection />
      <AboutSection />
    </Box>
  );
};

export default Index;
