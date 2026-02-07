// src/data/templateFields.ts

export const moduleNames: Record<string, string> = {
  ersattning: "EVF (Huvudärende)",
  ersattning_sub: "EVF (Underärende)",
  merkostnader: "Merkostnader (Huvudärende)",
  merkostnader_sub: "Merkostnader (Underärende)",
  ticket: "Biljett",
  templates: "Templates",
  chat: "Chat Templates",
  notes: "Noteringar",
};

// Simple definition for field metadata
interface FieldDef {
  label: string;
}

export const allModuleParts: Record<string, Record<string, FieldDef>> = {
  ersattning: {
    caseNumber: { label: "Ärendenummer" },
    decision: { label: "Beslut" },
    trainNumber: { label: "Tågnummer" },
    departureDate: { label: "Avgångsdatum" },
    departureDateWithTime: { label: "Avgångsdatum med tid" },
    departureStation: { label: "Avgångsstation" },
    arrivalStation: { label: "Ankomststation" },
    delay: { label: "Försening" },
  },
  merkostnader: {
    caseNumber: { label: "Ärendenummer" },
    category: { label: "Kategori" },
    decision: { label: "Beslut" },
    compensation: { label: "Ersättning" },
  },
  ticket: {
    bookingNumber: { label: "Bokningsnummer" },
    cardNumber: { label: "Kortnummer" },
    cost: { label: "Beställningsnummer/Pris" },
  },
  notes: {
    bookingNumber: { label: "Bokningsnummer" },
    newBookingNumber: { label: "Nytt bokningsnummer" },
    extraNote: { label: "Extra notering" },
    notesContent: { label: "Anteckningar" },
  },
  train: {
    // Add specific train fields if necessary, or leave empty if handled dynamically
  }
};