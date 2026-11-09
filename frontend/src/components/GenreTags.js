import React from "react";
import "./GenreTags.css";

const GenreTags = () => {
  const genres = ["ACTION", "SCI-FI", "COMEDY"];

  return (
    <div className="genre-tags">
      {genres.map((genre, index) => (
        <div key={index} className="genre-tag">
          {genre}
        </div>
      ))}
    </div>
  );
};

export default GenreTags;