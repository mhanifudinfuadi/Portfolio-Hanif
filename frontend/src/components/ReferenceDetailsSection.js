import React, { useEffect, useRef, useState } from "react";
import "./ReferenceDetailsSection.css";


// Local, safe IntersectionObserver-based reveal hook for scale/fade
const useScaleReveal = (rootMargin = "-20% 0px -65% 0px") => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    let observer;
    try {
      observer = new IntersectionObserver(
        entries => {
          const entry = entries[0];
          if (entry.isIntersecting) setActive(true);
          else setActive(false);
        },
        { root: null, rootMargin, threshold: 0 }
      );
      observer.observe(el);
    } catch (e) {
      // Fallback for older browsers
      const onScroll = () => {
        const rect = el.getBoundingClientRect();
        setActive(rect.top < window.innerHeight * 0.8);
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
      if (observer && el) observer.unobserve(el);
      if (observer) observer.disconnect();
    };
  }, [rootMargin]);

  return { ref, active };
};

const ReferenceDetailsSection = () => {
  const numbers = ["01", "02", "03", "04", "05"]; // added 05 on the right

  // Scale-in effects
  const { ref: markersRef, active: markersIn } = useScaleReveal("-10% 0px -80% 0px");
  const { ref: titleRef, active: titleIn } = useScaleReveal("-20% 0px -65% 0px");

  // Pop-in avatars & right image
  const { ref: avatarsRef, active: avatarsIn } = useScaleReveal("-15% 0px -75% 0px");
  const { ref: rightImgRef, active: rightImgIn } = useScaleReveal("-15% 0px -75% 0px");

  // Scale-in center card
  const { ref: cardRef, active: cardIn } = useScaleReveal("-15% 0px -70% 0px");

  return (
    <section className="cine-details" aria-label="Spider-Man 4 Details">
      <div className="details-wrap">
        {/* Row markers */}
        <div ref={markersRef} className="top-row">
          {numbers.map((n, idx) => (
            <div
              key={n}
              className={`marker scale-reveal ${markersIn ? "in" : ""}`}
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              {n}
            </div>
          ))}
        </div>

        {/* Center headline */}
        <h2
          ref={titleRef}
          className={`details-title scale-reveal ${titleIn ? "in" : ""}`}
        >
          SPIDER-MAN 4: RELEASE DATE, CAST, AND EVERYTHING YOU NEED TO KNOW!
        </h2>

        {/* Media row under headline: four left avatars, vertical arrows, right 120px image */}
        <div className="details-media-row" aria-hidden="true">
          <div className="media-left">
            <div className="avatar-group" ref={avatarsRef}>
              {[0,1,2,3].map((i) => (
                <div
                  className={`avatar-lg pop-reveal ${avatarsIn ? 'in' : ''}`}
                  key={`lg-${i}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <img
                    src="https://customer-assets.emergentagent.com/job_github-clone-14/artifacts/4er7pl2p_image%206344742.png"
                    alt={`Avatar ${i+1}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="media-center">
            <div className="arrow-stack">
              <div className="h-arrow right" />
              <div className="h-arrow left" />
            </div>
          </div>
          <div className="media-right">
            <img
              ref={rightImgRef}
              className={`right-disc pop-reveal ${rightImgIn ? 'in' : ''}`}
              src="https://customer-assets.emergentagent.com/job_github-clone-14/artifacts/4er7pl2p_image%206344742.png"
              alt="Right badge"
              style={{ animationDelay: `${4 * 60}ms` }}
            />
          </div>
        </div>

        {/* Three-column grid */}
        <div className="details-grid">
          {/* Left column */}
          <div className="col left">
            <div className="kicker">SPIDER-MAN :</div>
            <p className="copy">
              PART C — Following the events of No Way Home, Peter Parker returns to street‑level heroics in New York, rebuilding his life while protecting the city as a friendly neighborhood Spider‑Man.
            </p>
            <div className="media-image left-img">
              <img src="https://customer-assets.emergentagent.com/job_ui-animation-mvp/artifacts/o4h9d4y6_Frame%202121452983.png" alt="Feature image" />
            </div>
          </div>

          {/* Center column (card) */}
          <div className="col center">
            <div ref={cardRef} className={`film-card scale-reveal ${cardIn ? 'in' : ''}`} data-anchor="red-origin">
              <div className="film-head">FILM</div>
              <div className="film-title">SPIDER-MAN 4</div>

              <div className="tile-grid">
                {/* Top large tiles */}
                <div className="tile big map-tile">
                  <div className="map-pin" />
                  <div className="tile-label">MAP</div>
                </div>
                <div className="tile big cinema-tile">
                  <div className="tile-kicker">CINEMA</div>
                  <div className="tile-strong">MIDTOWN THEATRE</div>
                </div>

                {/* Bottom small tiles */}
                <div className="tile small">
                  <div className="small-label">DATE</div>
                  <div className="small-value">MAY 29</div>
                </div>
                <div className="tile small">
                  <div className="small-label">TIME</div>
                  <div className="small-value">9:30 PM</div>
                </div>
              </div>

              <button className="book-cta">Book Now<span className="cta-arrow" aria-hidden="true"> →</span></button>
            </div>
          </div>

          {/* Right column */}
          <div className="col right">
            <div className="kicker">PREMIERING :</div>
            <p className="copy">
              PART D — Rumors place the next Spider‑Man installment in early development with a focus on grounded stories, classic rogues, and life after high school for Peter Parker.
            </p>
            <div className="media-image right-img">
              <img src="https://customer-assets.emergentagent.com/job_ui-animation-mvp/artifacts/o4h9d4y6_Frame%202121452983.png" alt="Feature image" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating red origin fallback anchor */}
      <div className="red-origin-anchor" aria-hidden="true" />

      {/* Deadpool cutout placeholder overlapping bottom (hidden, replaced by floating overlay) */}
      <div className="dp-cutout" aria-hidden="true" />
    </section>
  );
};

export default ReferenceDetailsSection;