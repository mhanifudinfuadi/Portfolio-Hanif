# Frequently Asked Questions (FAQ)

## 📊 About Improvements Summary

**Q: What improvements were made to the portfolio website?**
A: Three major enhancements were implemented:
1. **Documentations Section** - New editorial-style layout for documentary photography works (inspired by httpster.net/foam-talent)
2. **Enhanced Journal UI** - Added quote display cards with different content categories (poetry, philosophical, daily notes)
3. **3D Book Viewer** - Interactive Three.js implementation for novel showcase

**Q: How many files were created/updated?**
A: 10 new CSS and JavaScript files were added across portfolio components, bringing the total to ~25+ files with consistent styling system.

---

## 🎨 Design & UI Questions

**Q: Why use Georgia serif font family throughout?**
A: Georgia provides a classic, elegant feel that works well for both photography portfolios and literary content. The natural contrast between display text (serif) and body text creates visual hierarchy while maintaining readability.

**Q: What's the significance of #fafaf9 color?**
A: This "archival paper" shade (#fafa... wait, it's actually #fafaf9 which is very light gray/beige) simulates aged paper tones used in archival documents. It provides warmth compared to pure white while maintaining clean contrast for text.

**Q: Why use clamp() for responsive font sizes?**
A: `clamp()` automatically scales typography between min and max bounds based on viewport size, providing smooth transitions from mobile (36px) → desktop (84px). This is better than using media queries for every breakpoint.

---

## 🚀 Development Questions

**Q: How do I run the project locally?**
A: Run these commands in order:
```bash
# Navigate to frontend folder
cd /Users/hanifudin/Downloads/web\ porto\ hanif/frontend

# Install dependencies (only if needed)
yarn install

# Start development server
yarn start
```

**Q: What is the default port?**
A: CRA uses port 3000 by default. If you see "Port 3000 is already in use", try: `PORT=5173 yarn start` or use Vite instead (`npm install @vitejs/react` and `npx vite`).

**Q: Do I need to rebuild after changes?**
A: No. CRA uses hot module replacement (HMR) by default, so all CSS/JS changes take effect immediately without rebuild.

---

## 🎭 Technical Questions

**Q: What is Three.js for this portfolio?**
A: Three.js provides WebGL-based interactive 3D rendering. In the Novel3DShowcase component, it creates an animated book cover that responds to mouse movements with smooth scale and rotation effects, giving a premium feel to published novels section.

**Q: Why use GSAP animations instead of CSS transitions?**
A: GSAP offers more granular control over complex animations. While CSS handles simple hover states well, for entrance animations across sections (staggered delays, custom easing curves), GSAP provides smoother 60fps performance with better timing functions.

**Q: How does the Three.js viewer handle different browsers?**
A: The current implementation relies on Chrome/FF which have good WebGL support. For Safari users who need updates for recent versions, it works well. Consider adding a fallback to static image display if WebGL fails.

---

## 📱 Responsive Design Questions

**Q: How does the site handle mobile responsiveness?**
A: Uses media queries at key breakpoints:
- Desktop: >768px (2-column grid)
- Tablet: 481-768px (1 column, adjusted spacing)
- Mobile: ≤480px (single stack layout)

**Q: Will the Three.js viewer work on mobile?**
A: Yes, but with limitations:
- ✅ Works on modern mobile browsers
- ❌ No touch gestures currently implemented (would require additional implementation)
- ✅ Static images still display if WebGL fails

---

## 🔧 API & Backend Questions

**Q: How do documentations load from the backend?**
A: The DocumentationsSection fetches data at mount time using:
```javascript
fetch(`${process.env.REACT_APP_BACKEND_URL}/portfolio/content?kind=documentation&published_only=true`)
  .then(response => response.json())
  .then(data => setDocumentations(...))
```

**Q: What environment variables are required?**
A: Backend URL is needed in `frontend/.env` (default: `REACT_APP_BACKEND_URL=http://localhost:5000`)

**Q: How does the API integration work?**
A: FastAPI backend routes (`/portfolio/content`) serve JSON data that matches component state patterns, allowing dynamic content updates without page reload.

---

## 🎯 Deployment Questions

**Q: Can I deploy this to production?**
A: Yes! Options include:
1. **Netlify** - Drag-and-drop frontend build
2. **Vercel** - Recommended for Next.js (though this is CRA)
3. **GitHub Pages** - Push `frontend/build` to a branch

**Q: What needs to be updated for production?**
A:
- Remove development-specific code blocks
- Update API URLs to production backend endpoint
- Optimize images (compression, resizing)
- Add proper error handling for failed requests
- Enable compression headers for serving static files

**Q: How do I optimize the 3D viewer for production?**
A: Use GSAP `render()` with performance monitoring:
```javascript
// Only render on interaction when needed
document.addEventListener('click', () => {
  gsap.set('book-page', {xPercent: -10});
});
```
