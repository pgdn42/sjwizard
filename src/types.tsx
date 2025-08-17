export interface ErsattningData {
  id?: string;
  caseNumber?: string; // Now optional for sub-cases
  caseNumbers?: string[]; // New: for sub-cases
  decision: string;
  trainNumber: string;
  departureDate: string;
  departureStation: string;
  arrivalStation: string;
  delay: string;
  producer: string;
}

export interface MerkostnadData {
  id?: string;
  caseNumber: string;
  category: string;
  decision: string;
  compensation: string;
}

export interface FormData {
  ersattning: ErsattningData & {
    // Use the base type
    subCases: ErsattningData[]; // Add an array for sub-cases
  };
  ticket: { bookingNumber: string; cardNumber: string; cost: string };
  merkostnader: MerkostnadData & {
    subCases: MerkostnadData[];
  };
  templates: { selectedTemplate: string; templateContent: string };
  notes: {
    bookingNumber: string;
    newBookingNumber: string;
    extraNote: string;
    notesContent: string;
  };
  train: {};
}

export interface UserSettings {
  copyConfig: CopyConfig;
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
  type: "copy" | "link";
  displayType: "icon" | "text";
  template: CopyTemplate;
}

export type ModuleCopyConfig = CustomButton[];

export type CopyConfig = {
  [K in keyof Partial<FormData>]?: ModuleCopyConfig;
};
