import type { CopyPart } from "../types";

export const moduleNames: { [key: string]: string } = {
  ersattning: "Ersättning",
  merkostnader: "Merkostnader",
  ticket: "Biljett",
  train: "Tåg",
  templates: "Mallar",
  notes: "Noteringar",
};

export const allModuleParts: { [key: string]: { [id: string]: CopyPart } } = {
  ersattning: {
    caseNumber: {
      id: "caseNumber",
      label: "Ärendenummer",
      type: "field",
      enabled: true,
    },
    decision: { id: "decision", label: "Beslut", type: "field", enabled: true },
    trainNumber: {
      id: "trainNumber",
      label: "Tågnummer",
      type: "field",
      enabled: true,
    },
    departureDate: {
      id: "departureDate",
      label: "Avgångsdatum",
      type: "field",
      enabled: true,
    },
    departureStation: {
      id: "departureStation",
      label: "Avgångsstation",
      type: "field",
      enabled: true,
    },
    arrivalStation: {
      id: "arrivalStation",
      label: "Ankomststation",
      type: "field",
      enabled: true,
    },
    delay: { id: "delay", label: "Försening", type: "field", enabled: true },
    producer: {
      id: "producer",
      label: "Producent",
      type: "field",
      enabled: true,
    },
    datetime: {
      id: "datetime",
      label: "Current Date/Time",
      type: "datetime",
      enabled: true,
    },
  },
  merkostnader: {
    caseNumber: {
      id: "caseNumber",
      label: "Ärendenummer",
      type: "field",
      enabled: true,
    },
    category: {
      id: "category",
      label: "Kategori",
      type: "field",
      enabled: true,
    },
    decision: { id: "decision", label: "Beslut", type: "field", enabled: true },
    compensation: {
      id: "compensation",
      label: "Ersättning",
      type: "field",
      enabled: true,
    },
  },
  ticket: {
    bookingNumber: {
      id: "bookingNumber",
      label: "Bokningsnummer",
      type: "field",
      enabled: true,
    },
    cardNumber: {
      id: "cardNumber",
      label: "Kortnummer",
      type: "field",
      enabled: true,
    },
    cost: {
      id: "cost",
      label: "Beställningsnummer",
      type: "field",
      enabled: true,
    },
  },
  notes: {
    bookingNumber: {
      id: "bookingNumber",
      label: "Bokningsnummer",
      type: "field",
      enabled: true,
    },
    newBookingNumber: {
      id: "newBookingNumber",
      label: "Nytt bokningsnummer",
      type: "field",
      enabled: true,
    },
    extraNote: {
      id: "extraNote",
      label: "Extra notering",
      type: "field",
      enabled: true,
    },
    notesContent: {
      id: "notesContent",
      label: "Anteckningar",
      type: "field",
      enabled: true,
    },
  },
};

// A pre-formatted list of options for our pickers
export const allFieldsAsOptions = Object.entries(allModuleParts).flatMap(
  ([moduleId, parts]) =>
    Object.entries(parts).map(([fieldId, part]) => ({
      value: `${moduleId}.${fieldId}`,
      label: `${moduleNames[moduleId] || "Unknown"}: ${part.label}`,
    }))
);
