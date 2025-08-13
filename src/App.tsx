import { useState, useEffect, useMemo } from "react";
import { ErsattningVidForsening } from "./components/ErsattningVidForsening";
import { Merkostnader } from "./components/Merkostnader";
import { Notes } from "./components/Notes";
import { Templates } from "./components/Templates";
import { Ticket } from "./components/Ticket";
import { Train } from "./components/Train";
import { Toolbar } from "./components/Toolbar";
import { SettingsModal } from "./components/SettingsModal";
import type { FormData, CopyConfig } from "./types";
import { onCollectionUpdate } from "./services/firestoreService";
import { replaceTemplateVariables } from "./utils"; // Import our new helper
import "./components/modules.css";
import TrashcanIcon from "./assets/trashcanIcon";
import SettingsIcon from "./assets/settingsIcon";

interface TemplateData {
  id: string;
  label: string;
  content: string;
}

interface TemplateOption {
  value: string;
  label: string;
}

const initialFormData: FormData = {
  ersattning: {
    caseNumber: "",
    decision: "AVSLAG",
    trainNumber: "",
    departureDate: "2025-08-12",
    departureStation: "",
    arrivalStation: "",
    delay: "",
    producer: "",
  },
  ticket: { bookingNumber: "", cardNumber: "", cost: "" },
  merkostnader: {
    caseNumber: "",
    category: "",
    decision: "approved",
    compensation: "",
  },
  templates: { selectedTemplate: "", templateContent: "" },
  notes: {
    bookingNumber: "",
    newBookingNumber: "",
    extraNote: "",
    notesContent: "",
  },
};

const initialCopyConfig: CopyConfig = {
  ersattning: {
    default: [
      {
        id: "caseNumber-1",
        fieldId: "caseNumber",
        label: "Ärendenummer",
        type: "field",
        enabled: true,
      },
      {
        id: "static-1",
        fieldId: "static",
        label: "Static Text",
        type: "static",
        value: " EVF ",
        enabled: true,
      },
      {
        id: "decision-1",
        fieldId: "decision",
        label: "Beslut",
        type: "field",
        enabled: true,
      },
      {
        id: "static-2",
        fieldId: "static",
        label: "Static Text",
        type: "static",
        value: " TÅG ",
        enabled: true,
      },
      {
        id: "trainNumber-1",
        fieldId: "trainNumber",
        label: "Tågnummer",
        type: "field",
        enabled: true,
      },
      {
        id: "static-3",
        fieldId: "static",
        label: "Static Text",
        type: "static",
        value: " ",
        enabled: true,
      },
      {
        id: "departureDate-1",
        fieldId: "departureDate",
        label: "Avgångsdatum",
        type: "field",
        enabled: true,
      },
      {
        id: "static-4",
        fieldId: "static",
        label: "Static Text",
        type: "static",
        value: " [",
        enabled: true,
      },
      {
        id: "datetime-1",
        fieldId: "datetime",
        label: "Current Date/Time",
        type: "datetime",
        enabled: true,
      },
      {
        id: "static-5",
        fieldId: "static",
        label: "Static Text",
        type: "static",
        value: "]",
        enabled: true,
      },
    ],
  },
  merkostnader: {
    approved: [
      {
        id: "static-approved-1",
        fieldId: "static",
        type: "static",
        label: "Static Text",
        value: "Godkänt ärende: ",
        enabled: true,
      },
      {
        id: "caseNumber-approved-1",
        fieldId: "caseNumber",
        type: "field",
        label: "Ärendenummer",
        enabled: true,
      },
    ],
    denied: [
      {
        id: "static-denied-1",
        fieldId: "static",
        type: "static",
        label: "Static Text",
        value: "Nekat ärende: ",
        enabled: true,
      },
      {
        id: "caseNumber-denied-1",
        fieldId: "caseNumber",
        type: "field",
        label: "Ärendenummer",
        enabled: true,
      },
    ],
    caseNote: [
      {
        id: "static-note-1",
        fieldId: "static",
        type: "static",
        label: "Static Text",
        value: "Notering: ",
        enabled: true,
      },
      {
        id: "caseNumber-note-1",
        fieldId: "caseNumber",
        type: "field",
        label: "Ärendenummer",
        enabled: true,
      },
    ],
  },
  notes: {
    trafikstorning: [
      {
        id: "static-trafik-1",
        fieldId: "static",
        type: "static",
        label: "Static Text",
        value: "Trafikstörning: Bknr ",
        enabled: true,
      },
      {
        id: "bookingNumber-trafik-1",
        fieldId: "bookingNumber",
        type: "field",
        label: "Bokningsnummer",
        enabled: true,
      },
    ],
    byteAvAvgang: [
      {
        id: "static-byte-1",
        fieldId: "static",
        type: "static",
        label: "Static Text",
        value: "Byte av avgång: Gammalt bknr ",
        enabled: true,
      },
      {
        id: "bookingNumber-byte-1",
        fieldId: "bookingNumber",
        type: "field",
        label: "Bokningsnummer",
        enabled: true,
      },
      {
        id: "static-byte-2",
        fieldId: "static",
        type: "static",
        label: "Static Text",
        value: ", nytt bknr ",
        enabled: true,
      },
      {
        id: "newBookingNumber-byte-1",
        fieldId: "newBookingNumber",
        type: "field",
        label: "Nytt bokningsnummer",
        enabled: true,
      },
    ],
    undantagsaterkop: [
      {
        id: "static-undantag-1",
        fieldId: "static",
        type: "static",
        label: "Static Text",
        value: "Undantagsåterköp: Bknr ",
        enabled: true,
      },
      {
        id: "bookingNumber-undantag-1",
        fieldId: "bookingNumber",
        type: "field",
        label: "Bokningsnummer",
        enabled: true,
      },
    ],
  },
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [copyConfig, setCopyConfig] = useState<CopyConfig>(initialCopyConfig);
  const [allTemplates, setAllTemplates] = useState<TemplateData[]>([]);

  useEffect(() => {
    const unsubscribe = onCollectionUpdate(
      "templates",
      null,
      (fetchedTemplates) => {
        const templates = fetchedTemplates.map((t) => ({
          id: t.id,
          label: t.label || "Untitled",
          content: t.content || "",
        }));
        setAllTemplates(templates);
      }
    );
    return () => unsubscribe();
  }, []);

  const templateOptions: TemplateOption[] = useMemo(() => {
    return allTemplates.map((template) => ({
      value: template.id,
      label: template.label,
    }));
  }, [allTemplates]);

  const handleDataChange = (
    section: keyof FormData,
    field: string,
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [section]: { ...prevData[section], [field]: value },
    }));
  };

  const handleClear = (section?: keyof FormData) => {
    if (section) {
      setFormData((prevData) => ({
        ...prevData,
        [section]: initialFormData[section],
      }));
    } else {
      setFormData(initialFormData);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const selected = allTemplates.find((t) => t.id === templateId);
    if (selected) {
      // 1. Replace variables in the content
      const processedContent = replaceTemplateVariables(
        selected.content,
        formData
      );

      // 2. Copy the final text to the clipboard
      navigator.clipboard.writeText(processedContent);

      // 3. Update the form state to show the selected template ID and its raw content
      setFormData((prev) => ({
        ...prev,
        templates: {
          selectedTemplate: templateId,
          templateContent: selected.content, // Show raw content in UI
        },
      }));
    }
  };

  return (
    <div className="app-container">
      <Toolbar>
        <button className="button-text">script</button>
        <button className="button-text">CHATT</button>
        <button className="button-text">SAMTAL</button>
        <button className="button-text">TCA</button>
        <button className="button-text">TRAFIKINFO</button>
        <button
          className="button-svg"
          title="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </button>
        <button
          className="button-svg"
          title="Clear all fields"
          onClick={() => handleClear()}
        >
          <TrashcanIcon />
        </button>
      </Toolbar>
      <ErsattningVidForsening
        data={formData.ersattning}
        onChange={(field, value) =>
          handleDataChange("ersattning", field, value)
        }
        onClear={() => handleClear("ersattning")}
        copyConfig={copyConfig.ersattning?.default || []}
      />
      <Merkostnader
        data={formData.merkostnader}
        onChange={(field, value) =>
          handleDataChange("merkostnader", field, value)
        }
        onClear={() => handleClear("merkostnader")}
        copyConfig={copyConfig.merkostnader || {}}
      />
      <div className="row-container">
        <div className="ticket-container">
          <Ticket
            data={formData.ticket}
            onChange={(field, value) =>
              handleDataChange("ticket", field, value)
            }
            onClear={() => handleClear("ticket")}
          />
        </div>
        <div className="train-container">
          <Train />
        </div>
      </div>
      <Templates
        selectedTemplateId={formData.templates.selectedTemplate}
        onSelectTemplate={handleTemplateSelect}
        allTemplates={allTemplates}
        templateOptions={templateOptions}
      />
      <Notes
        data={formData.notes}
        onChange={(field, value) => handleDataChange("notes", field, value)}
        onClear={() => handleClear("notes")}
        copyConfig={copyConfig.notes || {}}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        copyConfig={copyConfig}
        onSave={(newConfig) => setCopyConfig(newConfig)}
      />
    </div>
  );
}

export default App;
