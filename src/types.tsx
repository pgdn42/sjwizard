export interface FormData {
  ersattning: {
    caseNumber: string;
    decision: string;
    trainNumber: string;
    departureDate: string;
    departureStation: string;
    arrivalStation: string;
    delay: string;
    producer: string;
  };
  ticket: { bookingNumber: string; cardNumber: string; cost: string };
  merkostnader: {
    caseNumber: string;
    category: string;
    decision: string;
    compensation: string;
  };
  templates: { selectedTemplate: string; templateContent: string };
  notes: {
    bookingNumber: string;
    newBookingNumber: string;
    extraNote: string;
    notesContent: string;
  };
}

export interface CopyPart {
  id: string;
  fieldId?: string;
  label: string;
  enabled: boolean;
  type: "field" | "static" | "datetime";
  value?: string; // For static text
}

export type CopyTemplate = CopyPart[];

export type ModuleCopyConfig = {
  [templateName: string]: CopyTemplate;
};

export type CopyConfig = {
  // Using Partial to make modules optional, so we can add them one by one
  [K in keyof Partial<FormData>]?: ModuleCopyConfig;
};
