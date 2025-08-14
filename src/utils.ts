import type { CopyPart, FormData } from "./types";

/**
 * Replaces placeholders like {caseNumber} in a string with values from the formData object.
 */
export function replaceTemplateVariables(
  templateString: string,
  formData: FormData
): string {
  const flatData: { [key: string]: string } = {};
  for (const section in formData) {
    // @ts-ignore
    for (const field in formData[section]) {
      // @ts-ignore
      flatData[field] = formData[section][field];
    }
  }

  const replacedString = templateString.replace(/\{(.+?)\}/g, (match, key) => {
    return flatData[key.trim()] !== undefined ? flatData[key.trim()] : match;
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
