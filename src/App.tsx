import { useState } from "react";
import { ErsattningVidForsening } from "./components/ErsattningVidForsening";
import { Merkostnader } from "./components/Merkostnader";
import { Notes } from "./components/Notes";
import { Templates } from "./components/Templates";
import { Ticket } from "./components/Ticket";
import { Train } from "./components/Train";
import { Toolbar } from "./components/Toolbar";
import { SettingsModal } from "./components/SettingsModal";
import type { FormData, CopyConfig } from "./types";
import "./components/modules.css";
import TrashcanIcon from "./assets/trashcanIcon";
import SettingsIcon from "./assets/settingsIcon";

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
  ersattning: [
    { id: "caseNumber", label: "Ärendenummer", type: "field", enabled: true },
    {
      id: "static-1",
      label: "Static Text",
      type: "static",
      value: " EVF ",
      enabled: true,
    },
    { id: "decision", label: "Beslut", type: "field", enabled: true },
    {
      id: "static-2",
      label: "Static Text",
      type: "static",
      value: " TÅG ",
      enabled: true,
    },
    { id: "trainNumber", label: "Tågnummer", type: "field", enabled: true },
    {
      id: "static-3",
      label: "Static Text",
      type: "static",
      value: " ",
      enabled: true,
    },
    {
      id: "departureDate",
      label: "Avgångsdatum",
      type: "field",
      enabled: true,
    },
    {
      id: "static-4",
      label: "Static Text",
      type: "static",
      value: " [",
      enabled: true,
    },
    {
      id: "datetime",
      label: "Current Date/Time",
      type: "datetime",
      enabled: true,
    },
    {
      id: "static-5",
      label: "Static Text",
      type: "static",
      value: "]",
      enabled: true,
    },
  ],
};

function App() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [copyConfig, setCopyConfig] = useState<CopyConfig>(initialCopyConfig);

  const templateOptions = [
    { value: "delay_reason_1", label: "Förseningsorsak 1" },
    { value: "delay_reason_2", label: "Förseningsorsak 2" },
    { value: "delay_reason_3", label: "Förseningsorsak 3" },
    { value: "delay_reason_4", label: "Förseningsorsak 4" },
  ];

  const handleDataChange = (
    section: keyof FormData,
    field: string,
    value: string
  ) => {
    if (section === "templates" && field === "selectedTemplate") {
      const selectedTemplate = templateOptions.find(
        (opt) => opt.value === value
      );
      const newContent = selectedTemplate
        ? `Innehåll för ${selectedTemplate.label}.`
        : "";

      setFormData((prevData) => ({
        ...prevData,
        templates: {
          ...prevData.templates,
          selectedTemplate: value,
          templateContent: newContent,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [section]: { ...prevData[section], [field]: value },
      }));
    }
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
        copyConfig={copyConfig.ersattning || []}
      />
      <Merkostnader
        data={formData.merkostnader}
        onChange={(field, value) =>
          handleDataChange("merkostnader", field, value)
        }
        onClear={() => handleClear("merkostnader")}
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
        data={formData.templates}
        onChange={(field, value) => handleDataChange("templates", field, value)}
        templateOptions={templateOptions}
        onClear={() => handleClear("templates")}
      />
      <Notes
        data={formData.notes}
        onChange={(field, value) => handleDataChange("notes", field, value)}
        onClear={() => handleClear("notes")}
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
