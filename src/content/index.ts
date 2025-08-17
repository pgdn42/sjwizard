// A simple, powerful debounce utility.
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

// --- State and Configuration ---
let isExtractionEnabled = false;

// --- Helper Functions ---
const isCaseView = (url: string): boolean => {
  // Use the logic you discovered!
  return url.includes("SJ+Service+Request");
};

const getFieldValue = (label: string): string | null => {
  const element = document.querySelector(
    `[aria-label="${label}"]`
  ) as HTMLInputElement;
  return element ? element.value : null;
};

// --- Data Extraction Logic ---
const extractAllData = () => {
  const description = getFieldValue("Beskrivning(P)");
  let relatedErsattningCase = null;

  // Extract the related case number from the description
  if (description && description.includes("Merkostnad for SR - ")) {
    relatedErsattningCase = description.split(" - ")[1]?.trim();
  }

  const departureTimeRaw = getFieldValue("Avgångstid");
  const data = {
    compensation: getFieldValue("Ersättningsbelopp (kr)"),

    underkategori: getFieldValue("Underkategori"),
    relatedErsattningCase: relatedErsattningCase,

    caseType: getFieldValue("Ärendetyp"),
    mainCaseNumber: getFieldValue("Huvudärende"),

    departureStation: getFieldValue("Avgångsstation"),
    arrivalStation: getFieldValue("Ankomststation"),
    trainNumber: getFieldValue("Tågnummer"),
    delay: getFieldValue("Total försening"),
    caseNumber: getFieldValue("Ärendenummer"),

    bookingNumber: getFieldValue("Beställningsnummer"),
    cost: getFieldValue("Biljettkostnad (SJs del)"),
    cardNumber: getFieldValue("Nummer på Kort/TiM enkelbiljett"),

    departureDate: departureTimeRaw ? departureTimeRaw.replace(" ", "T") : null,
  };

  return data;
};

// --- Main Logic ---
const analyzeAndExtract = () => {
  // Only run if toggled on AND we are on a relevant page
  if (!isExtractionEnabled || !isCaseView(window.location.href)) {
    return;
  }

  const allValues = extractAllData();

  // Only send a message if we actually found some data
  if (Object.values(allValues).some((value) => value)) {
    console.log("SJ Wizard: Sending extracted values to app", allValues);
    chrome.runtime.sendMessage({
      type: "EXTRACTED_VALUES",
      payload: allValues,
    });
  }
};

const debouncedExtraction = debounce(analyzeAndExtract, 500);

// --- Event Listeners and Observers ---
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TOGGLE_EXTRACTION") {
    isExtractionEnabled = message.payload;
    console.log(
      `SJ Wizard: Data extraction ${
        isExtractionEnabled ? "enabled" : "disabled"
      }`
    );
    if (isExtractionEnabled) {
      debouncedExtraction();
    }
  }
});

// Observe the part of the page that changes. 'body' is a fallback;
// a more specific ID like '#content' would be more performant.
const targetNode = document.body;
const observer = new MutationObserver(debouncedExtraction);
observer.observe(targetNode, { childList: true, subtree: true });

// Also, run extraction when the URL search parameters change (for Siebel navigation)
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === "navigation") {
      debouncedExtraction();
    }
  });
}).observe({ type: "navigation", buffered: true });
