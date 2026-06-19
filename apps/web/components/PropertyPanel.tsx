"use client";

import { useState } from "react";

const COLORS = [
  "#ffffff", "#ff6b6b", "#ffa94d", "#ffd43b", "#69db7c",
  "#4dabf7", "#748ffc", "#da77f2", "#212529", "#868e96",
];

export default function PropertyPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      display: "flex",
      gap: 4,
      padding: "6px 10px",
      background: "#2d2d2d",
      borderRadius: 8,
      border: "1px solid #444",
      alignItems: "center",
      flexWrap: "wrap",
      fontSize: 13,
      color: "#ccc",
    }}>
      <span style={{ color: "#888" }}>Stroke</span>
      <ColorPicker colors={COLORS} />
      <span style={{ color: "#888" }}>Fill</span>
      <ColorPicker colors={COLORS} includeTransparent />
      <span style={{ color: "#888" }}>Width</span>
      <select
        style={{ background: "#3d3d3d", color: "#ccc", border: "1px solid #555", borderRadius: 4, padding: "2px 4px" }}
        defaultValue="2"
      >
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="4">4</option>
        <option value="6">6</option>
        <option value="8">8</option>
      </select>
      <span style={{ color: "#888" }}>Opacity</span>
      <input
        type="range"
        min="10"
        max="100"
        defaultValue="100"
        style={{ width: 60 }}
      />
    </div>
  );
}

function ColorPicker({ colors, includeTransparent }: { colors: string[]; includeTransparent?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {includeTransparent && (
        <button
          title="Transparent"
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid #555",
            background: "transparent",
            cursor: "pointer",
            position: "relative",
            padding: 0,
          }}
        >
          <span style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%) rotate(45deg)",
            width: "120%", height: 2, background: "#ff6b6b",
            display: "block",
          }} />
        </button>
      )}
      {colors.map((color) => (
        <button
          key={color}
          title={color}
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: color === "#ffffff" ? "2px solid #555" : "2px solid transparent",
            background: color,
            cursor: "pointer",
            padding: 0,
          }}
        />
      ))}
    </div>
  );
}
