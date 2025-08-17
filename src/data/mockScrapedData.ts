// This file contains mock data payloads to simulate what the content script would send.

// Scenario 1: A standard Ersättning case
export const mockStandardCase = {
  caseNumber: "1-STANDARD",
  trainNumber: "42",
  departureDate: "2025-08-17T14:30",
  departureStation: "Stockholm Central",
  arrivalStation: "Göteborg Central",
  delay: "75",
  caseType: "Huvudärende - RTG",
};

// Scenario 2: A Merkostnad sub-case with a related Ersättning case
export const mockMerkostnadSubCase = {
  mainCaseNumber: "1-MAIN-MERK",
  caseNumber: "1-SUB-MERK-1",
  caseType: "Kundserviceärende",
  underkategori: "transport",
  compensation: "250",
  relatedErsättningCase: "1-RELATED-ERS",
};

// Scenario 3: An Ersättning sub-case
export const mockErsattningSubCase = {
  mainCaseNumber: "1-MAIN-ERS",
  caseNumber: "1-SUB-ERS-1",
  caseType: "RTG",
  trainNumber: "555",
  delay: "130",
  departureDate: "2025-08-18T10:00",
  departureStation: "Malmö C",
  arrivalStation: "Stockholm C",
};
