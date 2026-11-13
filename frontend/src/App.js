import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PreLanding from "./components/PreLanding";
import PortfolioNav from "./components/portfolio/PortfolioNav";
import SideNav from "./components/portfolio/SideNav";
import PortfolioHero from "./components/portfolio/PortfolioHero";
import AboutSection from "./components/portfolio/AboutSection";
import WorksGrid from "./components/portfolio/WorksGrid";
import WorkDetail from "./components/portfolio/WorkDetail";
import Novel3DShowcase from "./components/portfolio/Novel3DShowcase";
import ServicesSection from "./components/portfolio/ServicesSection";
import FAQSection from "./components/portfolio/FAQSection";
import JournalSection from "./components/portfolio/JournalSection";
import ContactSection from "./components/portfolio/ContactSection";
import PortfolioFooter from "./components/portfolio/PortfolioFooter";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

/* Defined at module scope so the component identity (and therefore the
   whole page subtree) is not re-created on every App render. */
function PortfolioHome() {
  return (
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
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<PreLanding />} />
      <Route path="/portfolio" element={<PortfolioHome />} />
      <Route path="/karya/:contentId" element={<WorkDetail />} />
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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </div>
  );
}

export default App;
