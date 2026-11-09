import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PreLanding from "./components/PreLanding";
import PortfolioNav from "./components/portfolio/PortfolioNav";
import SideNav from "./components/portfolio/SideNav";
import PortfolioHero from "./components/portfolio/PortfolioHero";
import AboutSection from "./components/portfolio/AboutSection";
import WorksGrid from "./components/portfolio/WorksGrid";
import Novel3DShowcase from "./components/portfolio/Novel3DShowcase";
import ServicesSection from "./components/portfolio/ServicesSection";
import FAQSection from "./components/portfolio/FAQSection";
import JournalSection from "./components/portfolio/JournalSection";
import ContactSection from "./components/portfolio/ContactSection";
import PortfolioFooter from "./components/portfolio/PortfolioFooter";
import Login from "./components/Login";
import AuthCallback from "./components/AuthCallback";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const PortfolioHome = () => (
    <>
      <PortfolioNav />
      <SideNav />
      <PortfolioHero />
      <AboutSection />
      <WorksGrid />
      <Novel3DShowcase />
      <ServicesSection />
      <FAQSection />
      <JournalSection />
      <ContactSection />
      <PortfolioFooter />
    </>
  );

  // Router component that handles session_id detection synchronously
  function AppRouter() {
    const location = useLocation();
    
    // CRITICAL: Check URL fragment synchronously during render
    // This prevents race conditions by processing session_id FIRST
    if (location.hash?.includes('session_id=')) {
      return <AuthCallback />;
    }

    return (
      <Routes>
        <Route path="/" element={<PreLanding />} />
        <Route path="/portfolio" element={<PortfolioHome />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;