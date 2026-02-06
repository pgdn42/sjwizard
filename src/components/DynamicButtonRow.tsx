import React from "react";
import type { FormData, ModuleCopyConfig, CustomButton } from "../types";
import { buildStringFromTemplate } from "../utils";
import CopyIcon from "../assets/copyIcon";
import CopyCheckIcon from "../assets/copyCheckIcon";
import CopyCrossIcon from "../assets/copyCrossIcon";
import TrashcanIcon from "../assets/trashcanIcon";

const iconMap: { [key: string]: React.ComponentType } = {
  CopyIcon: CopyIcon,
  CopyCheckIcon: CopyCheckIcon,
  CopyCrossIcon: CopyCrossIcon,
};

interface DynamicButtonRowProps {
  buttons: ModuleCopyConfig;
  formData: FormData;
  contextData?: any; // <-- NEW PROP: Allow passing specific sub-case data for more flexible templates
  onClear?: () => void;
}

export function DynamicButtonRow({
  buttons,
  formData,
  contextData, // <-- Destructure it
  onClear,
}: DynamicButtonRowProps) {
  const handleButtonClick = (button: CustomButton) => {
    // Pass contextData to the engine
    if (button.type === "link") {
      let url = buildStringFromTemplate(button.template, formData, contextData);
      if (url) {
        if (!/^https?:\/\//i.test(url)) {
          url = "https://" + url;
        }
        window.open(url, "", "width=1350,height=1000,screenX=0,screenY=500");
      }
    } else {
      const textToCopy = buildStringFromTemplate(button.template, formData, contextData);
      navigator.clipboard.writeText(textToCopy);
    }
  };

  return (
    <div className="dynamic-buttons-container">
      <div className="dynamic-buttons-container-buttons">
        {buttons.map((button) => {
          const IconComponent = iconMap[button.icon] || CopyIcon;

          // --- UPDATED: Conditional Rendering ---
          if (button.displayType === "text") {
            return (
              <button
                key={button.id}
                className="button-text-small" // New class for smaller text buttons
                title={button.label}
                onClick={() => handleButtonClick(button)}
              >
                {button.label}
              </button>
            );
          }

          // Default to icon button
          return (
            <button
              key={button.id}
              className="button-svg"
              title={button.label}
              onClick={() => handleButtonClick(button)}
            >
              <IconComponent />
            </button>
          );
        })}
        {onClear && ( // Only render if onClear is provided
          <button
            className="button-svg"
            title="Clear all fields"
            onClick={onClear}
          >
            <TrashcanIcon />
          </button>
        )}
      </div>
    </div>
  );
}
