"use client";

export default function Toolbar() {
  const tools = [
    { id: "select", label: "Select", shortcut: "V", icon: "⬚" },
    { id: "rectangle", label: "Rectangle", shortcut: "R", icon: "▭" },
    { id: "diamond", label: "Diamond", shortcut: "D", icon: "◇" },
    { id: "ellipse", label: "Ellipse", shortcut: "O", icon: "○" },
    { id: "arrow", label: "Arrow", shortcut: "A", icon: "→" },
    { id: "line", label: "Line", shortcut: "L", icon: "╱" },
    { id: "text", label: "Text", shortcut: "T", icon: "T" },
    { id: "freehand", label: "Freehand", shortcut: "P", icon: "✎" },
    { id: "eraser", label: "Eraser", shortcut: "E", icon: "✕" },
    { id: "pan", label: "Pan", shortcut: "H", icon: "✋" },
  ];

  const handleToolClick = (toolId: string) => {
    const event = new KeyboardEvent("keydown", { key: toolId === "freehand" ? "p" : toolId[0] });
    window.dispatchEvent(event);
  };

  return (
    <div style={{
      display: "flex",
      gap: 2,
      padding: 6,
      background: "#2d2d2d",
      borderRadius: 8,
      border: "1px solid #444",
    }}>
      {tools.map((tool) => (
        <button
          key={tool.id}
          title={`${tool.label} (${tool.shortcut})`}
          onClick={() => handleToolClick(tool.id)}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 4,
            color: "#ccc",
            cursor: "pointer",
            fontSize: 16,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#3d3d3d"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
}
