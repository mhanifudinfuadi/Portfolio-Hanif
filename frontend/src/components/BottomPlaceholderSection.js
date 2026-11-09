import React from "react";
import "./BottomPlaceholderSection.css";

const BottomPlaceholderSection = () => {
  return (
    <section className="bottom-placeholder" aria-label="Poster Placeholder">
      <div className="bp-wrap">
        <div className="img-placeholder" role="img" aria-label="Image placeholder 554 by 426">
          <div className="red-target-anchor" data-anchor="red-target" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default BottomPlaceholderSection;