import { useEffect, useRef, useState } from "react";
import { NavElement, SideMenuProps } from "../types";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";

const SideMenu = ({ nav, isOpen, toggleMenu, logout, current_page }: SideMenuProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const submenuRef = useRef<HTMLUListElement>(null);

    const toggleSubMenu = (menuItem: string) => {
        setOpenSubMenu(openSubMenu === menuItem ? null : menuItem);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target as Node)
            ) {
                toggleMenu();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [toggleMenu]);

    const handleBlur = () => {
        setTimeout(() => {
            if (
                submenuRef.current &&
                !submenuRef.current.contains(document.activeElement)
            ) {
                setOpenSubMenu(null);
            }
        }, 0);
    };

    const handleNavClick = (
        event: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>,
        v: NavElement
    ) => {
        event.preventDefault();
        const isShiftKey = (event as React.KeyboardEvent<HTMLLIElement>).shiftKey;

        if (
            event.type === "click" ||
            (event as React.KeyboardEvent<HTMLLIElement>).key === "Enter"
        ) {
            if (v.submenus && v.submenus.length > 0) {
                toggleSubMenu(v.value);
            } else {
                if (isShiftKey) {
                    event.preventDefault();
                    if (v.to?.startsWith("?")) {
                        setTimeout(() => window.open(v.to, "_blank"), 0);
                    } else if (v.to?.startsWith("/")) {
                        setTimeout(() => window.open(v.to, "_blank"), 0);
                    }
                } else {
                    if (v.to) {
                        navigate(v.to);
                    } else if (v.to?.startsWith("/")) {
                        document.location = v.to;
                    }
                }
                toggleMenu();
            }
        }
    };

    const handleSubClick = (
        event: React.MouseEvent<HTMLLIElement | HTMLAnchorElement>,
        to: string
    ) => {
        event.preventDefault();
        const isShiftKey = event.shiftKey;

        if (to === "logout") {
            logout();
        } else if (to.startsWith("?")) {
            if (isShiftKey) {
                setTimeout(() => window.open(to, "_blank"), 0);
            } else {
                navigate(to);
            }
            toggleMenu();
        } else if (to.startsWith("/")) {
            if (isShiftKey) {
                setTimeout(() => window.open(to, "_blank"), 0);
            } else {
                document.location = to;
            }
            toggleMenu();
        }
        setOpenSubMenu(null);
    };

    const handleSubKeyDown = (
        event: React.KeyboardEvent<HTMLLIElement | HTMLAnchorElement>,
        to: string
    ) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            handleSubClick(
                {
                    currentTarget: event.currentTarget,
                    target: event.target,
                    shiftKey: event.shiftKey,
                    preventDefault: () => event.preventDefault(),
                    stopPropagation: () => event.stopPropagation(),
                } as React.MouseEvent<HTMLLIElement | HTMLAnchorElement>,
                to
            );
        }
    };

    return (
        <>
            {isOpen ? (
                <div className="side-menu-wrapper open">
                    <div className="backdrop">
                        <div className="menu-container" ref={sidebarRef}>
                            <button className="close-icon-btn" onClick={toggleMenu}>
                                <AiOutlineClose size={25} />
                            </button>
                            <nav id="sidebar">
                                <ul className="side-menu-list">
                                    {nav.map((v, idx) => {
                                        const isCurrent =
                                            current_page === v.value ||
                                            current_page === v.to ||
                                            current_page === v.compare_value ||
                                            (v.submenus &&
                                                v.submenus.some(
                                                    (submenu) =>
                                                        current_page === submenu.value ||
                                                        current_page === submenu.to
                                                ));

                                        return (
                                            <li
                                                key={idx}
                                                className="side-menu-li"
                                                onClick={(event) => {
                                                    if (!v.to) event.preventDefault();
                                                    handleNavClick(event, v);
                                                    toggleSubMenu(v.value);
                                                }}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" ||
                                                        event.key === " "
                                                    ) {
                                                        handleNavClick(event, v);
                                                    }
                                                }}
                                                onBlur={handleBlur}
                                            >
                                                <a
                                                    href={v.to || "#"}
                                                    className={
                                                        isCurrent
                                                            ? "side-menu-current"
                                                            : "side-menu-item"
                                                    }
                                                >
                                                    {v.value}
                                                </a>

                                                {openSubMenu === v.value &&
                                                    v.submenus &&
                                                    v.submenus.length > 0 && (
                                                        <ul
                                                            ref={submenuRef}
                                                            className="subitem-list"
                                                            onClick={(event) =>
                                                                event.stopPropagation()
                                                            }
                                                        >
                                                            {v.submenus.map(
                                                                (subItem, i) => (
                                                                    <li
                                                                        key={i}
                                                                        className={
                                                                            location.search ===
                                                                            subItem.to
                                                                                ? "current"
                                                                                : ""
                                                                        }
                                                                        onClick={(
                                                                            event
                                                                        ) => {
                                                                            event.stopPropagation();
                                                                            handleSubClick(
                                                                                event as React.MouseEvent<HTMLLIElement>,
                                                                                subItem.to
                                                                            );
                                                                        }}
                                                                        onKeyDown={(
                                                                            event
                                                                        ) =>
                                                                            handleSubKeyDown(
                                                                                event as React.KeyboardEvent<HTMLLIElement>,
                                                                                subItem.to
                                                                            )
                                                                        }
                                                                    >
                                                                        <a
                                                                            href={
                                                                                subItem.to ===
                                                                                "logout"
                                                                                    ? "#"
                                                                                    : subItem.to
                                                                            }
                                                                        >
                                                                            {
                                                                                subItem.value
                                                                            }
                                                                        </a>
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default SideMenu;
