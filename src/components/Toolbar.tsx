import React from "react";

interface ToolbarProps {
  children: React.ReactNode; // This allows you to pass buttons directly into the toolbar
}

export function Toolbar({ children }: ToolbarProps) {
  return (
    <div className="section-container">
      <div className="toolbar-controls">{children}</div>
    </div>
  );
}
