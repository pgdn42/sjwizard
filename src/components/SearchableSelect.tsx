import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  onEnter: (value: string) => void;
}

export function SearchableSelect({ options, onEnter }: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newFilteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(newFilteredOptions);
    setHighlightedIndex(newFilteredOptions.length > 0 ? 0 : -1);
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue: string) => {
    onEnter(selectedValue);
    setSearchTerm("");
    setDropdownOpen(false); // Close dropdown on selection for feedback
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Re-open the dropdown if it's closed and the user starts typing
    if (!isDropdownOpen && e.key !== "Enter" && e.key !== "Escape") {
      setDropdownOpen(true);
    }

    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (
        isDropdownOpen &&
        highlightedIndex >= 0 &&
        filteredOptions[highlightedIndex]
      ) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, filteredOptions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen && highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedItem = dropdownRef.current.children[
        highlightedIndex
      ] as HTMLLIElement;
      if (highlightedItem) {
        highlightedItem.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex, isDropdownOpen]);

  return (
    <div className="searchable-select" ref={containerRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setDropdownOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Sök mall..."
        className="input"
      />
      {isDropdownOpen && (
        <ul className="searchable-select-dropdown" ref={dropdownRef}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                className={highlightedIndex === index ? "highlighted" : ""}
                onClick={() => handleSelect(option.value)}
                onMouseOver={() => setHighlightedIndex(index)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="no-options">Inga resultat</li>
          )}
        </ul>
      )}
    </div>
  );
}
