import React, { useState } from "react";
import { Search, Menu } from "lucide-react";
import "./Navigation.css";

const Navigation = () => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { label: "TOP CASTS", id: "casts" },
    { label: "PRODUCTION", id: "production" },
    { label: "BOX OFFICE", id: "box-office" },
    { label: "IMAX", id: "imax" }
  ];

  return (
    <nav className="navigation">
      <div className="nav-content">
        {/* Logo */}
        <div className="nav-logo">
          <img
            className="logo-image"
            src="https://customer-assets.emergentagent.com/job_github-clone-14/artifacts/88oumzqs_Daily%20bugle.jpg"
            alt="Daily Bugle logo"
          />
        </div>

        {/* Navigation Items */}
        <div className="nav-items">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${hoveredItem === item.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Icons */}
        <div className="nav-icons">
          <button className="nav-icon">
            <Search size={28} />
          </button>
          <button className="nav-icon">
            <Menu size={28} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;