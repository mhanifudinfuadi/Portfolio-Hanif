import React, { useEffect, useRef, useState } from "react";
import "./FloatingRedPlaceholder.css";

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const FloatingRedPlaceholder = () => {
  const boxRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  const stateRef = useRef({
    startCenter: { x: 0, y: 0 },
    midCenter: { x: 0, y: 0 },
    endCenter: { x: 0, y: 0 },
    startScroll: 0,
    midScroll: 0,
    endScroll: 0,
    originW: 420,
    originH: 380,
    midW: 420,
    midH: 340,
    targetW: 554,
    targetH: 426,
    targetEl: null,
  });

  const measure = () => {
    const origin = document.querySelector('[data-anchor="red-origin"]') || document.querySelector('.red-origin-anchor');
    const target = document.querySelector('[data-anchor="red-target"]');
    const mid = document.querySelector('[data-anchor="red-mid"]');
    if (!origin || !target) {
      setEnabled(false);
      return;
    }

    const s = stateRef.current;

    // Compute origin: bottom-center of the film card. Start tucked just below the card like before.
    const ro = origin.getBoundingClientRect();
    // Start size slightly smaller than the card width, consistent with previous behavior
    s.originW = Math.max(220, Math.min(340, ro.width * 0.72));
    s.originH = Math.round(s.originW * 0.88);
    const offsetRight = 0; // start centered under the card
    const gapBelow = 8; // smaller gap so it visually attaches to the card bottom
    const startX = ro.left + ro.width / 2 + offsetRight + window.scrollX;
    const startY = ro.top + ro.height + (s.originH / 2 + gapBelow) + window.scrollY;
    s.startCenter = { x: startX, y: startY };

    // Mid waypoint (poster headline center) if present
    if (mid) {
      const rm = mid.getBoundingClientRect();
      s.midCenter = { x: rm.left + rm.width / 2 + window.scrollX, y: rm.top + rm.height / 2 + window.scrollY };
    } else {
      s.midCenter = s.startCenter;
    }

    const targetBox = target.closest('.img-placeholder') || target.parentElement || target;
    stateRef.current.targetEl = targetBox;
    const rt = targetBox.getBoundingClientRect();
    try {
      const cs = window.getComputedStyle(targetBox);
      const cw = parseFloat(cs.width);
      const ch = parseFloat(cs.height);
      const bl = parseFloat(cs.borderLeftWidth) || 0;
      const bt = parseFloat(cs.borderTopWidth) || 0;
      // content-box center + border offsets for perfect alignment
      s.endCenter = {
        x: rt.left + bl + cw / 2 + window.scrollX,
        y: rt.top + bt + ch / 2 + window.scrollY,
      };
      if (!Number.isNaN(cw) && !Number.isNaN(ch)) {
        s.targetW = cw;
        s.targetH = ch;
      }
    } catch (e) {
      // fallback to border-box center
      s.endCenter = { x: rt.left + rt.width / 2 + window.scrollX, y: rt.top + rt.height / 2 + window.scrollY };
    }

    // Timeline: start when origin point is ~65% viewport, mid at ~55%, end when target at ~50%
    s.startScroll = s.startCenter.y - window.innerHeight * 0.70;
    s.midScroll = s.midCenter.y - window.innerHeight * 0.55;
    s.endScroll = s.endCenter.y - window.innerHeight * 0.50;

    // Cache section element for fade-out
    s.sectionEl = origin.closest('.cine-details');

    setEnabled(true);
  };

  useEffect(() => {
    const t = setTimeout(measure, 60);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const s = stateRef.current;

    const update = () => {
      const box = boxRef.current;
      if (!box) return;
      const y = window.scrollY;

      const seg1Len = Math.max(1, s.midScroll - s.startScroll);
      const seg2Len = Math.max(1, s.endScroll - s.midScroll);

      let cxDoc, cyDoc, w, h, r;
      let pGlobal = 0;
      if (y <= s.midScroll) {
        const p1 = clamp((y - s.startScroll) / seg1Len, 0, 1);
        pGlobal = p1 * 0.6; // reserve first 60% of the animation
        cxDoc = lerp(s.startCenter.x, s.midCenter.x, p1);
        cyDoc = lerp(s.startCenter.y, s.midCenter.y, p1);
        w = lerp(s.originW, s.midW, p1);
        h = lerp(s.originH, s.midH, p1);
        r = lerp(28, 22, p1);
      } else {
        const p2 = clamp((y - s.midScroll) / seg2Len, 0, 1);
        pGlobal = 0.6 + p2 * 0.4; // last 40%
        cxDoc = lerp(s.midCenter.x, s.endCenter.x, p2);
        cyDoc = lerp(s.midCenter.y, s.endCenter.y, p2);
        w = lerp(s.midW, s.targetW, p2);
        h = lerp(s.midH, s.targetH, p2);
        r = lerp(22, 16, p2);
      }

      // Snap exactly to target box at the very end to ensure perfect alignment
      if (pGlobal > 0.98) {
        cxDoc = s.endCenter.x;
        cyDoc = s.endCenter.y;
        w = s.targetW;
        h = s.targetH;
        r = 16;
      }

      // Convert to viewport
      const cx = cxDoc - window.scrollX;
      const cy = cyDoc - window.scrollY;

      // Opacity: remain solid until very near the end then fade into target
      const fadeStart = 0.92;
      const fadeT = clamp((pGlobal - fadeStart) / (1 - fadeStart), 0, 1);
      // Opacity ramps in after card appears and ramps out near the final handoff
      // Delay appearance until just after the box is fully below the card
      const appearStart = 0.12;
      const appearT = clamp((pGlobal - appearStart) / 0.15, 0, 1);
      const disappearStart = 0.99; // fade only at the very end so user sees perfect overlay
      const fadeOutT = clamp((pGlobal - disappearStart) / (1 - disappearStart), 0, 1);
      const opacity = (1 - fadeOutT) * appearT;

      // Place box centered at (cx, cy)
      let left = cx - w / 2;
      let top = cy - h / 2;

      // If we have a live target element, refine with its latest rect for perfect overlay
      if (s.targetEl) {
        const tr = s.targetEl.getBoundingClientRect();
        const tcs = window.getComputedStyle(s.targetEl);
        const tcw = parseFloat(tcs.width);
        const tch = parseFloat(tcs.height);
        const tbl = parseFloat(tcs.borderLeftWidth) || 0;
        const tbt = parseFloat(tcs.borderTopWidth) || 0;
        const exactLeft = tr.left + tbl + (tcw - w) / 2;
        const exactTop = tr.top + tbt + (tch - h) / 2;
        if (!Number.isNaN(exactLeft) && !Number.isNaN(exactTop)) {
          left = exactLeft;
          top = exactTop;
        }
      }

      box.style.width = `${w}px`;
      box.style.height = `${h}px`;
      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.borderRadius = `${r}px`;
      box.style.opacity = `${opacity}`;

      // As the box grows, fade the rest of the section out (start just after it clears the card)
      if (s.sectionEl) {
        const contentFade = clamp((pGlobal - 0.15) / 0.35, 0, 1); // start earlier since we start from card bottom
        s.sectionEl.style.opacity = `${1 - contentFade}`;
        if (pGlobal > 0.9) s.sectionEl.style.visibility = 'hidden'; else s.sectionEl.style.visibility = 'visible';
      }

      // visibility gate: only show when between start/end with minor pad
      const inView = y > s.startScroll - 400 && y < s.endScroll + 200;
      box.style.display = inView ? "block" : "none";
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return (
    <div className="floating-red-layer" aria-hidden="true">
      <div ref={boxRef} className="floating-red-box" />
    </div>
  );
};

export default FloatingRedPlaceholder;