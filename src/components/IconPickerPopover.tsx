import React from "react";
import { iconMap, iconNames } from "../assets/iconLibrary";

interface IconPickerPopoverProps {
  onClose: () => void;
  onIconSelect: (iconName: string) => void;
  style: React.CSSProperties; // For positioning
}

export function IconPickerPopover({
  onClose,
  onIconSelect,
  style,
}: IconPickerPopoverProps) {
  return (
    <div
      className="icon-picker-popover"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="icon-picker-grid">
        {iconNames.map((name) => {
          const IconComponent = iconMap[name];
          return (
            <button
              key={name}
              className="icon-picker-button"
              onClick={() => {
                onIconSelect(name);
                onClose();
              }}
              title={name}
            >
              <IconComponent />
            </button>
          );
        })}
      </div>
    </div>
  );
}
