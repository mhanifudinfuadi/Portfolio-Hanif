import React, { useEffect, useRef } from "react";
import "./ReferenceSection.css";
import leftImgAsset from "../assets/left.jpg";
import centerImgAsset from "../assets/centre.jpg";
import rightImgAsset from "../assets/right.jpg";

// Safe scroll reveal hook declared BEFORE usage to avoid hoisting runtime errors
const useScrollReveal = (rootMargin = "-20% 0px -70% 0px") => {
  const ref = useRef(null);
  const [active, setActive] = React.useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target || typeof window === "undefined") return;

    let observer;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          setActive(entry.isIntersecting);
        },
        { root: null, rootMargin, threshold: 0 }
      );
      observer.observe(target);
    } catch (e) {
      // Fallback: no IntersectionObserver — degrade gracefully
      const onScroll = () => {
        const rect = target.getBoundingClientRect();
        setActive(rect.top < window.innerHeight * 0.3);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }
    return () => {
      if (observer && target) observer.unobserve(target);
      if (observer) observer.disconnect();
    };
  }, [rootMargin]);

  return { ref, active };
};

const ReferenceSection = () => {
  // Scroll reveal for the bridge scroller
  const { ref: topRef, active: scrollerActive } = useScrollReveal("0px 0px -100% 0px");
  // Reveal animations for white section
  const { ref: leftTitleRef, active: leftVisible } = useScrollReveal("-20% 0px -40% 0px");
  const { ref: rightTitleRef, active: rightVisible } = useScrollReveal("-20% 0px -40% 0px");
  const { ref: releaseRef, active: releaseVisible } = useScrollReveal("-25% 0px -50% 0px");
  // Independent reveal for top chips in black section
  const { ref: chipsRef, active: chipsVisible } = useScrollReveal("-15% 0px -85% 0px");

  return (

    <section className="cine-section" aria-label="Cine Daily Reference Section">
      {/* Bridge Infinity Scroller positioned above black section using z-index */}
      <div className={`top-bridge-scroller ${scrollerActive ? "active" : ""}`} aria-hidden="true" ref={topRef}>
        <div className="infinite-scroller">
          <div className="scroller-track">
            {[...Array(24)].map((_, i) => (
              <div key={`tb-a-${i}`} className="scroller-avatar">
                <img src="https://customer-assets.emergentagent.com/job_github-clone-14/artifacts/4er7pl2p_image%206344742.png" alt="Spider icon" />
              </div>
            ))}
            {[...Array(24)].map((_, i) => (
              <div key={`tb-b-${i}`} className="scroller-avatar">
                <img src="https://customer-assets.emergentagent.com/job_github-clone-14/artifacts/4er7pl2p_image%206344742.png" alt="Spider icon" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Top dark panel */}
      <div className="cine-top">
        <div className="cine-top-inner">
          {/* Left column: Production */}
          <div className="cine-left">
            <div className="cine-subtitle">PRODUCTION</div>
            <div className="marvel-badge" aria-label="Marvel Studios">MARVEL STUDIOS</div>
            <div className="cine-left-meta">
              <div className="counter-circle">02</div>
              <div className="stars" aria-label="Rating 4 of 5">
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star filled">★</span>
                <span className="star">★</span>
              </div>
            </div>
          </div>

          {/* Center stack image placeholder */}
          <div className="cine-center">
            <div className={`card-stack ${leftVisible || rightVisible ? 'fan-in' : ''}`}>
              <div className="card bg1">
                <img className="card-img" src={leftImgAsset} alt="Left card" />
              </div>
              <div className="card bg2">
                <img className="card-img" src={rightImgAsset} alt="Right card" />
              </div>
              <div className="card main">
                <img className="card-img" src={centerImgAsset} alt="Center card" />
                <div className="deadpool-emblem" />
              </div>
            </div>
          </div>

          {/* Right column: Quote */}
          <div className="cine-right">
            <div className="quote">
              <span className="quote-mark">“</span>
              SPIDER-MAN WAS SUPPOSED TO SWING OFF INTO THE SUNSET AFTER ‘NO WAY HOME’… LOOKS LIKE THE WEB NEVER SNAPS!
            </div>
            <div className="pager-dots" aria-hidden="true">
              <span className="dot active" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        </div>

        {/* Floating chips */}
        <div className={`chips ${chipsVisible ? 'in' : ''}`}>
          <div ref={chipsRef} className="chip white">
            <div className="chip-title">TRAILER</div>
            <div className="chip-value">3:04</div>
          </div>
          <div className="chip red">
            <div className="chip-title">IMAX</div>
            <div className="chip-value">6</div>
          </div>
          <div className="chip dark">
            <div className="chip-title">DEC</div>
            <div className="chip-value">17</div>
          </div>
        </div>
      </div>

      {/* Divider arrows only */}
      <div className="cine-divider">
        <button className="edge-arrow left" aria-label="Previous">‹</button>
        <button className="edge-arrow right" aria-label="Next">›</button>
      </div>

      {/* Bottom light panel */}
      <div className="cine-bottom">
        <div className="bottom-bar" />

        {/* Centered BY overlay (non-interactive) */}
        <div className="by-overlay" aria-hidden="true">BY</div>

        {/* New independent layout per reference */}
        <div className="directed-grid">
          <div className="col-left">
            <h2 ref={leftTitleRef} className={`big-direct fade-slide-left ${leftVisible ? 'in' : ''}`}>DIRECTED</h2>
            <div className="release-left">RELEASE DATE :</div>
          </div>
          <div className="col-right">
            <div ref={releaseRef} className={`release-detail fade-slide-top ${releaseVisible ? 'in' : ''}`} role="region" aria-label="Release details">
              <p className="release-copy-right">
                No Way Home was released in the United States on December 17, 2021. It follows Peter Parker as he seeks help from Doctor Strange to restore his secret identity, leading to a multiverse collision that changes his world forever.
              </p>
            </div>
            <h2 ref={rightTitleRef} className={`big-right fade-slide-right ${rightVisible ? 'in' : ''}`}>JONATHAN WATTS</h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferenceSection;