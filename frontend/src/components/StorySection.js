import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import "./StorySection.css";

const StorySection = () => {
  const [isHovered, setIsHovered] = useState(false);

  const storyText = `When a multiverse threat arises, Peter Parker must join forces with familiar allies to face his greatest challenge. The fate of all realities now rests in his hands.`;

  return (
    <div className="story-section">
      <div className="story-content">
        <div className="story-text">
          <h3 className="story-title">THE ULTIMATE SPIDER-MAN STORY</h3>
          <p className="story-description">
            {storyText}
          </p>
        </div>
        
        <div className="cta-container">
          <button 
            className={`book-now-btn ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="btn-text">BOOK NOW</span>
            <ArrowRight className="btn-arrow" aria-hidden="true" />
            <div className="btn-glow"></div>
          </button>

          <div className="cta-right-cluster" aria-hidden="true">
            <div className="circle-count">
              <span className="count-text">01</span>
            </div>
            <div className="circle-image-placeholder"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorySection;