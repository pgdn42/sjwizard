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
  onClear: () => void;
}

export function DynamicButtonRow({
  buttons,
  formData,
  onClear,
}: DynamicButtonRowProps) {
  const handleButtonClick = (button: CustomButton) => {
    if (button.type === "link") {
      const url = buildStringFromTemplate(button.template, formData, "");
      if (url) {
        window.open(url, "_blank");
      }
    } else {
      const textToCopy = buildStringFromTemplate(button.template, formData);
      navigator.clipboard.writeText(textToCopy);
    }
  };

  return (
    <div className="dynamic-buttons-container">
      {buttons.map((button) => {
        const IconComponent = iconMap[button.icon] || CopyIcon;
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
      <button className="button-svg" title="Clear all fields" onClick={onClear}>
        <TrashcanIcon />
      </button>
    </div>
  );
}
