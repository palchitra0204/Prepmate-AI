import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Check,
    ChevronDown,
} from "lucide-react";

import "../styles/themeSelect.css";

const ThemeSelect = ({
    value = "",
    onChange,
    options = [],
    placeholder = "Select an option",
    ariaLabel = "Select an option",
    disabled = false,
}) => {
    const [isOpen, setIsOpen] =
        useState(false);

    const containerRef =
        useRef(null);

    const selectedOption =
        options.find(
            (option) =>
                String(option.value) ===
                String(value)
        );

    useEffect(() => {
        const handleOutsideClick = (
            event
        ) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target
                )
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    const handleSelect = (
        selectedValue
    ) => {
        onChange(selectedValue);
        setIsOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className={`theme-select ${isOpen
                    ? "theme-select-open"
                    : ""
                } ${disabled
                    ? "theme-select-disabled"
                    : ""
                }`}
        >
            <button
                type="button"
                className="theme-select-trigger"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
                onClick={() =>
                    setIsOpen(
                        (previousValue) =>
                            !previousValue
                    )
                }
            >
                <span
                    className={
                        selectedOption
                            ? "theme-select-value"
                            : "theme-select-placeholder"
                    }
                >
                    {selectedOption
                        ? selectedOption.label
                        : placeholder}
                </span>

                <ChevronDown
                    size={18}
                    className="theme-select-arrow"
                />
            </button>

            {isOpen && (
                <div
                    className="theme-select-menu"
                    role="listbox"
                    aria-label={ariaLabel}
                >
                    {options.map((option) => {
                        const isSelected =
                            String(option.value) ===
                            String(value);

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={
                                    isSelected
                                }
                                className={`theme-select-option ${isSelected
                                        ? "theme-select-option-selected"
                                        : ""
                                    }`}
                                onClick={() =>
                                    handleSelect(
                                        option.value
                                    )
                                }
                            >
                                <span>
                                    {option.label}
                                </span>

                                {isSelected && (
                                    <Check size={17} />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ThemeSelect;