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
    id,
    value = "",
    onChange,
    options = [],
    placeholder = "Select an option",
    ariaLabel = "Select an option",
    disabled = false,
}) => {
    const [isOpen, setIsOpen] =
        useState(false);

    const containerRef = useRef(null);
    const optionRefs = useRef([]);

    const selectedIndex =
        options.findIndex(
            (option) =>
                String(option.value) ===
                String(value),
        );

    const selectedOption =
        selectedIndex >= 0
            ? options[selectedIndex]
            : null;

    const menuId = id
        ? `${id}-menu`
        : undefined;

    useEffect(() => {
        const handleOutsideClick = (
            event,
        ) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target,
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
            handleOutsideClick,
        );

        document.addEventListener(
            "keydown",
            handleEscape,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );

            document.removeEventListener(
                "keydown",
                handleEscape,
            );
        };
    }, []);

    useEffect(() => {
        if (disabled) {
            setIsOpen(false);
        }
    }, [disabled]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const nextIndex =
            selectedIndex >= 0
                ? selectedIndex
                : 0;

        window.requestAnimationFrame(() => {
            optionRefs.current[
                nextIndex
            ]?.focus();
        });
    }, [isOpen, selectedIndex]);

    const handleSelect = (
        selectedValue,
    ) => {
        onChange?.(selectedValue);
        setIsOpen(false);
    };

    const handleTriggerKeyDown = (
        event,
    ) => {
        if (
            event.key === "ArrowDown" ||
            event.key === "ArrowUp"
        ) {
            event.preventDefault();
            setIsOpen(true);
        }
    };

    const handleOptionKeyDown = (
        event,
        index,
    ) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();

            const nextIndex =
                (index + 1) %
                options.length;

            optionRefs.current[
                nextIndex
            ]?.focus();
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            const previousIndex =
                (index -
                    1 +
                    options.length) %
                options.length;

            optionRefs.current[
                previousIndex
            ]?.focus();
        }

        if (
            event.key === "Home"
        ) {
            event.preventDefault();
            optionRefs.current[0]?.focus();
        }

        if (event.key === "End") {
            event.preventDefault();

            optionRefs.current[
                options.length - 1
            ]?.focus();
        }

        if (event.key === "Escape") {
            event.preventDefault();
            setIsOpen(false);
        }
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
                id={id}
                type="button"
                className="theme-select-trigger"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={menuId}
                disabled={disabled}
                onKeyDown={
                    handleTriggerKeyDown
                }
                onClick={() =>
                    setIsOpen(
                        (previousValue) =>
                            !previousValue,
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
                    id={menuId}
                    className="theme-select-menu"
                    role="listbox"
                    aria-label={ariaLabel}
                >
                    {options.map(
                        (option, index) => {
                            const isSelected =
                                String(
                                    option.value,
                                ) === String(value);

                            return (
                                <button
                                    ref={(element) => {
                                        optionRefs.current[
                                            index
                                        ] = element;
                                    }}
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={
                                        isSelected
                                    }
                                    tabIndex={-1}
                                    className={`theme-select-option ${isSelected
                                            ? "theme-select-option-selected"
                                            : ""
                                        }`}
                                    onKeyDown={(event) =>
                                        handleOptionKeyDown(
                                            event,
                                            index,
                                        )
                                    }
                                    onClick={() =>
                                        handleSelect(
                                            option.value,
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
                        },
                    )}
                </div>
            )}
        </div>
    );
};

export default ThemeSelect;