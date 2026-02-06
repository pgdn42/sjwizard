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

export interface CustomButton {
  id: string;
  label: string;
  icon: string;
  type: "copy" | "link";
  displayType: "icon" | "text";
  template: string; // <--- CHANGED TO STRING
}
export interface ChatTemplateData {
  id?: string;
  labelSE: string;
  contentSE: string;
  labelEN: string;
  contentEN: string;
  visibility: "private" | "public";
  ownerId: string;
  createdAt?: string;
}

export type ModuleCopyConfig = CustomButton[];

export type CopyConfig = {
  [key: string]: ModuleCopyConfig | undefined;
};