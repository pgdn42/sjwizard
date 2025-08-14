import React, { useState } from "react";
import type { UserSettings } from "../App";
import type { CopyConfig } from "../types";

const moduleNames: { [key: string]: string } = {
  ersattning: "Ersättning",
  merkostnader: "Merkostnader",
  ticket: "Biljett",
  notes: "Noteringar",
};

interface ManageButtonsTabProps {
  internalSettings: UserSettings;
  setInternalSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

export function ManageButtonsTab({
  internalSettings,
  setInternalSettings,
}: ManageButtonsTabProps) {
  const [selectedModule, setSelectedModule] =
    useState<keyof CopyConfig>("ersattning");

  // TODO: Add handler functions for adding, editing, deleting, and reordering buttons.

  return (
    <div>
      <p className="settings-hint">
        Note: Button content is configured in the "Copy Templates" tab.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <label>Module:</label>
        <select
          style={{ flex: 1 }}
          value={selectedModule}
          onChange={(e) =>
            setSelectedModule(e.target.value as keyof CopyConfig)
          }
        >
          {Object.keys(moduleNames).map((key) => (
            <option key={key} value={key}>
              {moduleNames[key]}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-rows-container">
        <p>Button management UI will go here.</p>
      </div>

      <div className="add-part-controls">
        <button>Add New Button</button>
      </div>
    </div>
  );
}
