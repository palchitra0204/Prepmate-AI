import {
    Children,
    cloneElement,
    isValidElement,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "motion/react";

import {
    VscArchive,
    VscCommentDiscussion,
    VscHistory,
    VscHome,
    VscSettingsGear,
} from "react-icons/vsc";

import {
    Upload,
} from "lucide-react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import "../styles/dock.css";

const DockItem = ({
    children,
    onClick,
    mouseX,
    spring,
    distance,
    magnification,
    baseItemSize,
    label,
    isActive,
}) => {
    const itemRef = useRef(null);

    const isHovered =
        useMotionValue(0);

    const mouseDistance =
        useTransform(
            mouseX,
            (mousePosition) => {
                const rectangle =
                    itemRef.current?.getBoundingClientRect();

                if (!rectangle) {
                    return Infinity;
                }

                return (
                    mousePosition -
                    rectangle.left -
                    rectangle.width / 2
                );
            }
        );

    const targetSize =
        useTransform(
            mouseDistance,
            [-distance, 0, distance],
            [
                baseItemSize,
                magnification,
                baseItemSize,
            ]
        );

    const size = useSpring(
        targetSize,
        spring
    );

    const handleKeyDown = (
        event
    ) => {
        if (
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            onClick?.();
        }
    };

    return (
        <motion.button
            ref={itemRef}
            type="button"
            className={`dock-item ${isActive
                    ? "dock-item-active"
                    : ""
                }`}
            style={{
                width: size,
                height: size,
            }}
            onHoverStart={() =>
                isHovered.set(1)
            }
            onHoverEnd={() =>
                isHovered.set(0)
            }
            onFocus={() =>
                isHovered.set(1)
            }
            onBlur={() =>
                isHovered.set(0)
            }
            onClick={onClick}
            onKeyDown={handleKeyDown}
            aria-label={label}
            aria-current={
                isActive
                    ? "page"
                    : undefined
            }
        >
            {Children.map(
                children,
                (child) =>
                    isValidElement(child)
                        ? cloneElement(child, {
                            isHovered,
                        })
                        : child
            )}

            {isActive && (
                <motion.span
                    className="dock-active-dot"
                    layoutId="dock-active-dot"
                    transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 28,
                    }}
                />
            )}
        </motion.button>
    );
};

const DockLabel = ({
    children,
    isHovered,
}) => {
    const [
        isVisible,
        setIsVisible,
    ] = useState(false);

    useEffect(() => {
        if (!isHovered) {
            return undefined;
        }

        const unsubscribe =
            isHovered.on(
                "change",
                (latestValue) => {
                    setIsVisible(
                        latestValue === 1
                    );
                }
            );

        return unsubscribe;
    }, [isHovered]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.span
                    className="dock-label"
                    initial={{
                        opacity: 0,
                        y: 4,
                        scale: 0.95,
                    }}
                    animate={{
                        opacity: 1,
                        y: -9,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        y: 4,
                        scale: 0.95,
                    }}
                    transition={{
                        duration: 0.16,
                    }}
                    role="tooltip"
                >
                    {children}
                </motion.span>
            )}
        </AnimatePresence>
    );
};

const DockIcon = ({
    children,
}) => {
    return (
        <span className="dock-icon">
            {children}
        </span>
    );
};

const Dock = ({
    spring = {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    },
    magnification = 68,
    distance = 170,
    panelHeight = 68,
    dockHeight = 108,
    baseItemSize = 48,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const mouseX =
        useMotionValue(Infinity);

    const isHovered =
        useMotionValue(0);

    const openChat = () => {
        if (
            location.pathname ===
            "/dashboard"
        ) {
            const chatSection =
                document.getElementById(
                    "dashboard-chat"
                );

            chatSection?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            window.setTimeout(() => {
                document
                    .getElementById(
                        "dashboard-prompt"
                    )
                    ?.focus();
            }, 500);

            return;
        }

        navigate("/dashboard", {
            state: {
                focusChat: true,
            },
        });
    };

    const items = [
        {
            icon: (
                <VscHome size={20} />
            ),
            label: "Dashboard",
            path: "/dashboard",
            onClick: () =>
                navigate("/dashboard"),
        },

        {
            icon: (
                <VscArchive size={20} />
            ),
            label: "Materials",
            path: "/materials",
            onClick: () =>
                navigate("/materials"),
        },

        {
            icon: (
                <Upload size={20} />
            ),
            label: "Upload Material",
            path: "/upload",
            onClick: () =>
                navigate("/upload"),
        },

        {
            icon: (
                <VscHistory size={20} />
            ),
            label: "History",
            path: "/history",
            onClick: () =>
                navigate("/history"),
        },

        {
            icon: (
                <VscCommentDiscussion
                    size={20}
                />
            ),
            label: "Chat",
            path: null,
            onClick: openChat,
        },

        {
            icon: (
                <VscSettingsGear
                    size={20}
                />
            ),
            label: "Settings",
            path: "/settings",
            onClick: () =>
                navigate("/settings"),
        },
    ];

    const isItemActive = (
        item
    ) => {
        if (!item.path) {
            return false;
        }

        if (
            item.path === "/dashboard"
        ) {
            return (
                location.pathname ===
                "/dashboard"
            );
        }

        return (
            location.pathname ===
            item.path ||
            location.pathname.startsWith(
                `${item.path}/`
            )
        );
    };

    const maximumHeight =
        useMemo(
            () =>
                Math.max(
                    dockHeight,
                    magnification +
                    magnification / 2
                ),
            [
                dockHeight,
                magnification,
            ]
        );

    const targetHeight =
        useTransform(
            isHovered,
            [0, 1],
            [
                panelHeight,
                maximumHeight,
            ]
        );

    const height = useSpring(
        targetHeight,
        spring
    );

    return (
        <motion.div
            className="dock-position"
            style={{ height }}
        >
            <motion.div
                className="dock-panel"
                style={{
                    height: panelHeight,
                }}
                initial={{
                    opacity: 0,
                    y: 24,
                    scale: 0.96,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 18,
                }}
                onMouseMove={(event) => {
                    isHovered.set(1);

                    mouseX.set(
                        event.clientX
                    );
                }}
                onMouseLeave={() => {
                    isHovered.set(0);
                    mouseX.set(Infinity);
                }}
                role="toolbar"
                aria-label="Application navigation"
            >
                {items.map((item) => (
                    <DockItem
                        key={item.label}
                        onClick={item.onClick}
                        mouseX={mouseX}
                        spring={spring}
                        distance={distance}
                        magnification={
                            magnification
                        }
                        baseItemSize={
                            baseItemSize
                        }
                        label={item.label}
                        isActive={isItemActive(
                            item
                        )}
                    >
                        <DockIcon>
                            {item.icon}
                        </DockIcon>

                        <DockLabel>
                            {item.label}
                        </DockLabel>
                    </DockItem>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default Dock;