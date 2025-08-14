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
  moduleId?: keyof FormData;
  label: string;
  enabled: boolean;
  type: "field" | "static" | "datetime" | "linebreak";
  value?: string;
  appendPeriod?: boolean;
  lineBreakCount?: number;
}

export type CopyTemplate = CopyPart[];

export interface CustomButton {
  id: string;
  label: string;
  icon: string;
  type: "copy" | "link"; // Added type property
  template: CopyTemplate;
}

export type ModuleCopyConfig = CustomButton[];

export type CopyConfig = {
  [K in keyof Partial<FormData>]?: ModuleCopyConfig;
};
