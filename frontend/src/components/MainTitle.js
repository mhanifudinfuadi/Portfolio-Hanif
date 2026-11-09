import React from "react";
import "./MainTitle.css";

const MainTitle = () => {
  const castMembers = {
    topLeft: ["Tom Holland", "Tobey Maguire"],
    topRight: ["Andrew Garfield", "Zendaya"]
  };

  const largeNames = new Set(["Tobey Maguire", "Andrew Garfield", "Zendaya", "Tom Holland"]);

  return (
    <div className="main-title-section">
      {/* Top Left Cast */}
      <div className="cast-names top-left">
        {castMembers.topLeft.map((name, index) => (
          <div key={index} className={`cast-name ${largeNames.has(name) ? 'large-cast' : ''}`}>
            {name}
          </div>
        ))}
      </div>

      {/* Top Right Cast */}
      <div className="cast-names top-right">
        {castMembers.topRight.map((name, index) => (
          <div key={index} className={`cast-name ${largeNames.has(name) ? 'large-cast' : ''}`}>
            {name}
          </div>
        ))}
      </div>

      {/* Main Title */}
      <div className="title-container">
        <div className="background-shape"></div>
        <div className="main-title">
          <div className="fit-text-container">
            <span
              className="title-text fit-text"
              data-min-font="24"
              data-max-font="220"
              data-multiline="false"
              data-padding="0"
            >
              SPIDERMAN
            </span>
          </div>
        </div>
        <div className="character-placeholder">
          <div className="character-silhouette">
            <div className="spider-web-pattern"></div>
          </div>
        </div>
      </div>

      {/* Infinity Scroller - restored */}
      <div className="infinite-scroller-container">
        <div className="infinite-scroller" aria-hidden="true">
          <div className="scroller-track">
            {[...Array(24)].map((_, i) => (
              <div key={`ph-a-${i}`} className="scroller-avatar">
                <img src="https://customer-assets.emergentagent.com/job_github-clone-14/artifacts/4er7pl2p_image%206344742.png" alt="Spider icon" />
              </div>
            ))}
            {[...Array(24)].map((_, i) => (
              <div key={`ph-b-${i}`} className="scroller-avatar">
                <img src="https://customer-assets.emergentagent.com/job_github-clone-14/artifacts/4er7pl2p_image%206344742.png" alt="Spider icon" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainTitle;