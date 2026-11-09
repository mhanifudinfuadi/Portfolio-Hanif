import React, { useEffect } from "react";
import Navigation from "./Navigation";
import GenreTags from "./GenreTags";
import MainTitle from "./MainTitle";
import StorySection from "./StorySection";
import "./SpiderManHero.css";
import { initFitTextClass } from "../utils/fitText";

const SpiderManHero = () => {
  // Add a page-loaded class to body on mount to trigger CSS-only animations
  useEffect(() => {
    document.body.classList.add("page-loaded");
    const cleanupFit = initFitTextClass({ defaultMin: 24, defaultMax: 220 });
    return () => {
      document.body.classList.remove("page-loaded");
      if (cleanupFit) cleanupFit();
    };
  }, []);

  return (
    <div className="spiderman-hero">
      <Navigation />
      <GenreTags />
      <MainTitle />
      <div className="bottom-hero-placeholder" aria-hidden="true" />
      <StorySection />
    </div>
  );
};

export default SpiderManHero;