import React, { useEffect, useRef, useState } from "react";
import "./WhiteStage.css";

// Wraps the whole white area and renders a single fixed halo background
const WhiteStage = ({ children }) => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const computeActive = () => {
      const rect = el.getBoundingClientRect();
      // viewport intersects section
      const intersects = rect.top < window.innerHeight && rect.bottom > 0;
      setActive(intersects);
    };

    let obs;
    try {
      obs = new IntersectionObserver(() => computeActive(), { root: null, threshold: 0 });
      obs.observe(el);
    } catch (e) {
      // no-op, fallback to scroll
    }

    computeActive();
    window.addEventListener("scroll", computeActive, { passive: true });
    window.addEventListener("resize", computeActive);
    return () => {
      window.removeEventListener("scroll", computeActive);
      window.removeEventListener("resize", computeActive);
      if (obs) obs.disconnect();
    };
  }, []);

  return (
    <section ref={ref} className="white-stage">
      <div className={`white-halo ${active ? "visible" : ""}`} aria-hidden="true">
        <div className="wh-line h" />
        <div className="wh-line v" />
        <div className="wh-circle" />
      </div>
      <div className="white-stage-content">{children}</div>
    </section>
  );
};

export default WhiteStage;