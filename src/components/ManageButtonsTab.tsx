import React, { useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { UserSettings } from "../App";
import type { CopyConfig, CustomButton } from "../types";
import { ButtonListItem } from "./ButtonListItem";
import { IconPickerPopover } from "./IconPickerPopover";
import { iconMap } from "../assets/iconLibrary";
import { moduleNames } from "../data/templateFields";

const defaultNewButton: Omit<CustomButton, "id" | "template"> = {
  label: "New Button",
  icon: "CopyIcon",
  type: "copy",
  displayType: "icon",
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
  const [newButton, setNewButton] = useState(defaultNewButton);

  const [isPickerOpen, setPickerOpen] = useState(false);
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({});

  const currentButtons = internalSettings.copyConfig[selectedModule] || [];

  const handleIconSelect = (iconName: string) => {
    if (editingButtonId === "new") {
      setNewButton((prev) => ({ ...prev, icon: iconName }));
    } else if (editingButtonId) {
      handleButtonChange(editingButtonId, { icon: iconName });
    }
    setEditingButtonId(null);
  };

  const openIconPicker = (
    e: React.MouseEvent<HTMLButtonElement>,
    buttonId: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const POPOVER_WIDTH = 200; // Must match the width in CSS

    setPopoverPosition({
      top: `${rect.top - 160}px`,
      left: `${rect.left + rect.width / 2 - POPOVER_WIDTH / 2}px`, // Center the popover
    });

    setEditingButtonId(buttonId);
    setPickerOpen(true);
  };

  const handleAddButton = () => {
    const buttonToAdd: CustomButton = {
      ...newButton,
      id: `btn-${Date.now()}`,
      template: [],
    };
    setInternalSettings((prev) => ({
      ...prev,
      copyConfig: {
        ...prev.copyConfig,
        [selectedModule]: [
          ...(prev.copyConfig[selectedModule] || []),
          buttonToAdd,
        ],
      },
    }));
    setNewButton(defaultNewButton);
  };

  const handleButtonChange = (
    buttonId: string,
    newProps: Partial<CustomButton>
  ) => {
    const newButtons = currentButtons.map((btn) =>
      btn.id === buttonId ? { ...btn, ...newProps } : btn
    );
    setInternalSettings((prev) => ({
      ...prev,
      copyConfig: { ...prev.copyConfig, [selectedModule]: newButtons },
    }));
  };

  const handleDeleteButton = (buttonId: string) => {
    if (window.confirm("Are you sure you want to delete this button?")) {
      const newButtons = currentButtons.filter((btn) => btn.id !== buttonId);
      setInternalSettings((prev) => ({
        ...prev,
        copyConfig: { ...prev.copyConfig, [selectedModule]: newButtons },
      }));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = currentButtons.findIndex((b) => b.id === active.id);
      const newIndex = currentButtons.findIndex((b) => b.id === over.id);
      const newOrderedButtons = arrayMove(currentButtons, oldIndex, newIndex);
      setInternalSettings((prev) => ({
        ...prev,
        copyConfig: { ...prev.copyConfig, [selectedModule]: newOrderedButtons },
      }));
    }
  };

  return (
    <div
      className="manage-buttons-layout"
      onClick={() => isPickerOpen && setPickerOpen(false)}
    >
      {isPickerOpen && (
        <IconPickerPopover
          onClose={() => setPickerOpen(false)}
          onIconSelect={handleIconSelect}
          style={popoverPosition}
        />
      )}

      <p className="settings-hint">
        Hint: Configure the content for these buttons in the "Copy Templates"
        tab.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "15px",
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
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentButtons}
            strategy={verticalListSortingStrategy}
          >
            {currentButtons.map((button) => (
              <ButtonListItem
                key={button.id}
                button={button}
                onButtonChange={handleButtonChange}
                onDeleteButton={handleDeleteButton}
                onEditIcon={(e) => openIconPicker(e, button.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="add-part-controls">
        <div className="add-button-staging-area">
          <span className="drag-handle-placeholder" />
          <input
            type="text"
            value={newButton.label}
            onChange={(e) =>
              setNewButton((prev) => ({ ...prev, label: e.target.value }))
            }
            className="settings-row-input"
            placeholder="New Button Label"
          />
          <select
            value={newButton.type}
            onChange={(e) =>
              setNewButton((prev) => ({
                ...prev,
                type: e.target.value as "copy" | "link",
              }))
            }
          >
            <option value="copy">Copy</option>
            <option value="link">Link</option>
          </select>
          <div className="button-config-group">
            <select
              value={newButton.displayType}
              onChange={(e) =>
                setNewButton((prev) => ({
                  ...prev,
                  displayType: e.target.value as "icon" | "text",
                }))
              }
            >
              <option value="icon">Icon</option>
              <option value="text">Text</option>
            </select>
            {newButton.displayType === "icon" && (
              <button
                className="button-icon-preview"
                onClick={(e) => openIconPicker(e, "new")}
              >
                {React.createElement(
                  iconMap[newButton.icon] || iconMap.CopyIcon
                )}
              </button>
            )}
            <button onClick={handleAddButton}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
