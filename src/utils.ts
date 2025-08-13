import type { FormData } from "./types";

/**
 * Replaces placeholders like {caseNumber} in a string with values from the formData object.
 *
 * @param templateString The string containing placeholders.
 * @param formData The complete form data.
 * @returns The string with all placeholders replaced with their corresponding values.
 */
export function replaceTemplateVariables(
  templateString: string,
  formData: FormData
): string {
  // Flatten the nested formData object for easier lookups
  // e.g., { ersattning: { caseNumber: '123' } } becomes { caseNumber: '123' }
  const flatData: { [key: string]: string } = {};
  for (const section in formData) {
    // @ts-ignore
    for (const field in formData[section]) {
      // @ts-ignore
      flatData[field] = formData[section][field];
    }
  }

  // Use a regular expression to find all instances of {key}
  const replacedString = templateString.replace(/\{(.+?)\}/g, (match, key) => {
    // Look up the key in our flattened data.
    // If it exists, return the value; otherwise, return the original match (e.g., "{unfound_key}")
    return flatData[key.trim()] !== undefined ? flatData[key.trim()] : match;
  });

  return replacedString;
}
