import type { CopyPart, FormData } from "./types";

/**
 * Replaces placeholders like {caseNumber} in a string with values from the formData object.
 */
/**
 * Replaces placeholders like {module.field} in a string with values from the formData object.
 * Example: "Case number is {ersattning.caseNumber}"
 */
export function replaceTemplateVariables(
  templateString: string,
  formData: FormData
): string {
  const replacedString = templateString.replace(/\{(.+?)\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const keys = trimmedKey.split(".");

    // Check for the "module.field" format
    if (keys.length === 2) {
      const [moduleId, fieldId] = keys as [keyof FormData, string];
      if (
        formData[moduleId] &&
        typeof formData[moduleId] === "object" &&
        fieldId in formData[moduleId]
      ) {
        // @ts-ignore - We've confirmed the keys exist.
        const value = formData[moduleId][fieldId];
        return value !== undefined && value !== null ? String(value) : "";
      }
    }
    // If the key doesn't match the "module.field" format, return the original placeholder.
    // This prevents accidental replacement with undefined.
    return match;
  });

  return replacedString;
}

/**
 * Generates a string from a copy template and form data.
 * @param template The array of CopyPart objects defining the template.
 * @param formData The full data object.
 * @param separator The character to join parts with (defaults to a space).
 * @returns The final, formatted string.
 */
export function buildStringFromTemplate(
  template: CopyPart[],
  formData: FormData,
  separator: string = " "
): string {
  const now = new Date();
  const formattedDateTime = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now
    .getHours()
    .toString()
    .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const stringParts = template
    .filter((part) => part.enabled)
    .map((part) => {
      let value = "";
      switch (part.type) {
        case "field":
          if (part.moduleId && part.fieldId) {
            // @ts-ignore
            value = formData[part.moduleId]?.[part.fieldId] || "";
          }
          if (value && part.appendPeriod) {
            value += ".";
          }
          break;
        case "static":
          value = part.value || "";
          break;
        case "datetime":
          value = formattedDateTime;
          break;
        case "linebreak":
          value = "\n".repeat(part.lineBreakCount || 1);
          break;
      }
      return value;
    });

  let result = "";
  for (let i = 0; i < stringParts.length; i++) {
    const currentPart = stringParts[i];
    if (currentPart.length === 0) continue;
    result += currentPart;
    if (i < stringParts.length - 1) {
      const nextPart = stringParts[i + 1];
      if (
        nextPart.length > 0 &&
        !currentPart.includes("\n") &&
        !nextPart.includes("\n")
      ) {
        result += separator;
      }
    }
  }
  return result;
}
export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
) {
  const properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
    "tabSize",
    "MozTabSize",
  ];

  const isFirefox = "mozInnerScreenX" in window;

  const div = document.createElement("div");
  div.id = "input-textarea-caret-position-mirror-div";
  document.body.appendChild(div);

  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = "pre-wrap";
  style.wordWrap = "break-word";
  style.position = "absolute";
  style.visibility = "hidden";

  properties.forEach(function (prop) {
    // @ts-ignore
    style[prop] = computed[prop];
  });

  if (isFirefox) {
    if (element.scrollHeight > parseInt(computed.height))
      style.overflowY = "scroll";
  } else {
    style.overflow = "hidden";
  }

  div.textContent = element.value.substring(0, position);

  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  const coordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth),
    left: span.offsetLeft + parseInt(computed.borderLeftWidth),
    height: parseInt(computed.lineHeight),
  };

  document.body.removeChild(div);

  // Get textarea's absolute position
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + coordinates.top - element.scrollTop,
    left: rect.left + coordinates.left,
    height: coordinates.height,
  };
}
