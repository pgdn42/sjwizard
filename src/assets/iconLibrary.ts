import React from "react";
import CopyIcon from "./copyIcon";
import CopyCheckIcon from "./copyCheckIcon";
import CopyCrossIcon from "./copyCrossIcon";
import PencilIcon from "./PencilIcon";

export const iconMap: { [key: string]: React.ComponentType } = {
  CopyIcon,
  CopyCheckIcon,
  CopyCrossIcon,
  PencilIcon,

  // Add more icons here in the future
};

export const iconNames = Object.keys(iconMap);
