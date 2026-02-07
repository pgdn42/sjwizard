import type { FormData } from "./types";

const getNestedValue = (obj: any, path: string): string => {
  if (!obj) return "";
  return path.split(".").reduce((acc, part) => (acc && acc[part] ? acc[part] : ""), obj) || "";
};

export function replaceTemplateVariables(
  templateString: string,
  formData: FormData
): string {
  return buildStringFromTemplate(templateString, formData);
}

export function buildStringFromTemplate(
  template: string,
  formData: FormData,
  contextData: any = null
): string {
  if (!template || typeof template !== "string") return "";

  let result = template;

  // 1. HANDLE CONDITIONAL BLOCKS (IF/ELSE)
  // Syntax: {{#if_has_subcases}} ... {{else}} ... {{/if}}
  const hasSubCases = 
    (formData.ersattning?.subCases?.length > 0) || 
    (formData.merkostnader?.subCases?.length > 0);

  const ifRegex = /{{#if_has_subcases}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{\/if}}/g;

  result = result.replace(ifRegex, (_: string, rawIfContent: string, rawElseContent: string | undefined) => {
    // TRIM FIX: Remove leading/trailing newlines from the blocks so the tags themselves don't add gaps
    const ifContent = rawIfContent ? rawIfContent.replace(/^\n+|\n+$/g, "") : "";
    const elseContent = rawElseContent ? rawElseContent.replace(/^\n+|\n+$/g, "") : "";
    
    return hasSubCases ? ifContent : elseContent;
  });

  // 2. HANDLE LOOPS
  const loopPatterns = [
    { tag: "ersattning", source: formData.ersattning.subCases },
    { tag: "merkostnader", source: formData.merkostnader.subCases },
  ];

  loopPatterns.forEach(({ tag, source }) => {
    const regex = new RegExp(`{{#loop_${tag}}}([\\s\\S]*?){{\\/loop}}`, "g");
    
    result = result.replace(regex, (_: string, rawInnerContent: string) => {
      if (!source || !Array.isArray(source) || source.length === 0) return "";
      
      // TRIM FIX: Remove newlines immediately inside the loop tags
      const innerContent = rawInnerContent.replace(/^\n+|\n+$/g, "");

      return source
        .map((item) => {
          return innerContent.replace(/{([a-zA-Z0-9_.]+)}/g, (__: string, key: string) => {
             // Handle special virtual date fields for ersattning items
             if (tag === "ersattning") {
               if (key === "underarende.ersattning.departureDateWithTime" || key === "departureDateWithTime") {
                 const dateValue = (item as any).departureDate;
                 return dateValue ? String(dateValue).replace("T", " ") : "";
               }
               if (key === "underarende.ersattning.departureDate" || key === "departureDate") {
                 const dateValue = (item as any).departureDate;
                 return dateValue ? String(dateValue).split("T")[0] : "";
               }
             }
             
             // A. Check for explicit "underarende.TAG." prefix
             const loopPrefix = `underarende.${tag}.`;
             if (key.startsWith(loopPrefix)) {
                const itemKey = key.replace(loopPrefix, "");
                if (item && itemKey in item) {
                    return String(item[itemKey as keyof typeof item] || "");
                }
             }

             // B. Fallback for short syntax inside loop (e.g. {decision})
             if (item && key in item) {
                 return String(item[key as keyof typeof item] || "");
             }

             // C. Fallback to global data
             return getNestedValue(formData, key);
          });
        })
        .join("\n"); // Join items with a single newline
    });
  });

  // 3. HANDLE VARIABLES (Context Aware)
  result = result.replace(/{([a-zA-Z0-9_.]+)}/g, (_: string, key: string) => {
    let value = "";
    
    // Handle special date formatting cases FIRST (before normal variable resolution)
    // These are virtual fields that transform departureDate
    if (key === "ersattning.departureDateWithTime" || key === "underarende.ersattning.departureDateWithTime" || key === "departureDateWithTime") {
      // Get the actual departureDate value
      let dateValue = contextData?.departureDate;
      
      // If no contextData, try to get from first subcase for underarende references
      if (!dateValue && key === "underarende.ersattning.departureDateWithTime") {
        dateValue = formData.ersattning?.subCases?.[0]?.departureDate;
      }
      
      // Fallback to main case
      if (!dateValue) {
        dateValue = getNestedValue(formData, "ersattning.departureDate");
      }
      
      // Replace T with space: "2025-08-17T20:12" -> "2025-08-17 20:12"
      return dateValue ? String(dateValue).replace("T", " ") : "";
    }
    
    if (key === "ersattning.departureDate" || key === "underarende.ersattning.departureDate") {
      // Get the actual departureDate value
      let dateValue = contextData?.departureDate;
      
      // If no contextData, try to get from first subcase for underarende references
      if (!dateValue && key === "underarende.ersattning.departureDate") {
        dateValue = formData.ersattning?.subCases?.[0]?.departureDate;
      }
      
      // Fallback to main case
      if (!dateValue) {
        dateValue = getNestedValue(formData, "ersattning.departureDate");
      }
      
      // Extract just the date part: "2025-08-17T20:12" -> "2025-08-17"
      return dateValue ? String(dateValue).split("T")[0] : "";
    }
    
    // Handle underarende.* prefixes when contextData is provided (for sub-case buttons)
    if (contextData) {
      // Check if the key uses underarende.ersattning.* or underarende.merkostnader.* prefix
      if (key.startsWith("underarende.ersattning.")) {
        const fieldName = key.replace("underarende.ersattning.", "");
        if (fieldName in contextData) {
          value = String(contextData[fieldName] || "");
        }
      } else if (key.startsWith("underarende.merkostnader.")) {
        const fieldName = key.replace("underarende.merkostnader.", "");
        if (fieldName in contextData) {
          value = String(contextData[fieldName] || "");
        }
      } else if (key in contextData) {
        // Direct field access without underarende prefix
        value = String(contextData[key] || "");
      } else {
        value = getNestedValue(formData, key);
      }
    } else {
      // No contextData - check if this is an underarende reference
      if (key.startsWith("underarende.ersattning.")) {
        const fieldName = key.replace("underarende.ersattning.", "");
        // Try to get from first subcase
        const firstSubCase = formData.ersattning?.subCases?.[0];
        if (firstSubCase && fieldName in firstSubCase) {
          value = String((firstSubCase as any)[fieldName] || "");
        }
      } else if (key.startsWith("underarende.merkostnader.")) {
        const fieldName = key.replace("underarende.merkostnader.", "");
        // Try to get from first subcase
        const firstSubCase = formData.merkostnader?.subCases?.[0];
        if (firstSubCase && fieldName in firstSubCase) {
          value = String((firstSubCase as any)[fieldName] || "");
        }
      } else {
        value = getNestedValue(formData, key);
      }
    }
    
    return value;
  });

  return result;
}

/**
 * Calculates coordinates for the Field Picker Popover.
 */
export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
) {
  const properties = [
    "direction", "boxSizing", "width", "height", "overflowX", "overflowY",
    "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
    "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
    "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize",
    "fontSizeAdjust", "lineHeight", "fontFamily", "textAlign", "textTransform",
    "textIndent", "textDecoration", "letterSpacing", "wordSpacing", "tabSize", "MozTabSize",
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
  
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + coordinates.top - element.scrollTop,
    left: rect.left + coordinates.left,
    height: coordinates.height,
  };
}