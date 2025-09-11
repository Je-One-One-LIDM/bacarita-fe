"use client";
import { useState } from "react";
import { TextHighlightProps } from "../interface/components.interface";

const TextHighlight = ({ text, currentWordIndex, isRead = false, onWordClick }: TextHighlightProps) => {
  const [hoveredWordIndex, setHoveredWordIndex] = useState<number | null>(null);

  const words = text.split(" ");

  const getWordStyle = (index: number) => {
    if (currentWordIndex === index) {
      return {
        backgroundColor: "#FFE55C",
        color: "var(--color-text-primary)",
        border: "2px solid #4A90E2",
        borderRadius: "4px",
        padding: "2px 4px",
        fontWeight: "bold",
      };
    } else if (index < currentWordIndex || isRead) {
      return {
        backgroundColor: "#E8F5E8",
        color: "var(--color-text-primary)",
        borderRadius: "4px",
        padding: "2px 4px",
        opacity: 0.8,
      };
    } else if (hoveredWordIndex === index) {
      return {
        backgroundColor: "#F0F8FF",
        color: "var(--color-text-primary)",
        borderRadius: "4px",
        padding: "2px 4px",
        cursor: "pointer",
      };
    } else {
      return {
        color: "var(--color-text-primary)",
        cursor: "pointer",
        padding: "2px 4px",
        borderRadius: "4px",
      };
    }
  };

  return (
    <p className="text-xl leading-relaxed mb-4" style={{ fontFamily: "OpenDyslexic, Arial, sans-serif" }}>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block mr-2 transition-all duration-200"
          style={getWordStyle(index)}
          onClick={() => onWordClick(index)}
          onMouseEnter={() => setHoveredWordIndex(index)}
          onMouseLeave={() => setHoveredWordIndex(null)}
        >
          {word}
        </span>
      ))}
    </p>
  );
};

export default TextHighlight;
