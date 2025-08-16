import { useState, useEffect, useRef } from "react";

interface FieldOption {
  value: string;
  label: string;
}

interface FieldPickerPopoverProps {
  onSelect: (value: string) => void;
  onClose: () => void;
  fields: FieldOption[];
}

export function FieldPickerPopover({
  onSelect,
  onClose,
  fields,
}: FieldPickerPopoverProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Auto-focus the search input when the popover opens
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredFields = fields.filter((field) =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Scroll the highlighted item into view
    if (listRef.current && filteredFields[highlightedIndex]) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLLIElement;
      highlightedElement?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex, filteredFields]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, filteredFields.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredFields[highlightedIndex]) {
        onSelect(filteredFields[highlightedIndex].value);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <>
      <div className="modal-overlay-transparent" onClick={onClose} />
      <div className="field-picker-popover">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search fields..."
          className="input"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setHighlightedIndex(0); // Reset highlight on search
          }}
          onKeyDown={handleKeyDown}
        />
        <ul className="searchable-select-dropdown" ref={listRef}>
          {filteredFields.length > 0 ? (
            filteredFields.map((field, index) => (
              <li
                key={field.value}
                className={highlightedIndex === index ? "highlighted" : ""}
                onMouseOver={() => setHighlightedIndex(index)}
                onClick={() => onSelect(field.value)}
              >
                {field.label}
              </li>
            ))
          ) : (
            <li className="no-options">No matching fields</li>
          )}
        </ul>
      </div>
    </>
  );
}
