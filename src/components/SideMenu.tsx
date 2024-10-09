import { useEffect, useRef, useState } from "react";
import { NavElement, SideMenuProps } from "../types";
import { AiOutlineClose } from "react-icons/ai";
import { NavLink, useNavigate } from "react-router-dom";

const SideMenu = ({ nav, isOpen, toggleMenu, logout, current_page }: SideMenuProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const navigate = useNavigate();
    const sidebarRef = useRef<HTMLDivElement>(null);

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

    const handleNavClick = (
        event:
            | React.MouseEvent<HTMLAnchorElement | HTMLLIElement>
            | React.KeyboardEvent<HTMLAnchorElement | HTMLLIElement>,
        v: NavElement
    ) => {
        event.preventDefault();
        const isShiftKey = (
            event as React.KeyboardEvent<HTMLAnchorElement | HTMLLIElement>
        ).shiftKey;

        if (
            event.type === "click" ||
            (event as React.KeyboardEvent<HTMLAnchorElement | HTMLLIElement>).key ===
                "Enter"
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
        const isShiftKey = event.shiftKey;

        if (to === "logout") {
            logout();
        } else if (to.startsWith("?")) {
            if (isShiftKey) {
                event.preventDefault();
                setTimeout(() => window.open(to, "_blank"), 0);
            } else {
                navigate(to);
            }
            toggleMenu();
        } else if (to.startsWith("/")) {
            event.preventDefault();
            if (isShiftKey) {
                setTimeout(() => window.open(to, "_blank"), 0);
            } else {
                document.location = to;
            }
            toggleMenu();
        }
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
                                        const isCurrent = current_page === v.value;
                                        const containerClass = isCurrent
                                            ? "side-menu-current"
                                            : "side-menu-item";

                                        return (
                                            <li
                                                key={idx}
                                                onClick={() => toggleSubMenu(v.value)}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" ||
                                                        event.key === " "
                                                    ) {
                                                        handleNavClick(event, v);
                                                    }
                                                }}
                                            >
                                                {v.to ? (
                                                    <NavLink
                                                        to={v.to}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleNavClick(
                                                                event as React.MouseEvent<HTMLAnchorElement>,
                                                                v
                                                            );
                                                        }}
                                                        onKeyDown={(event) => {
                                                            if (
                                                                event.key === "Enter" ||
                                                                event.key === " "
                                                            ) {
                                                                handleNavClick(
                                                                    event as React.KeyboardEvent<HTMLAnchorElement>,
                                                                    v
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div className={containerClass}>
                                                            {v.value}
                                                        </div>
                                                    </NavLink>
                                                ) : (
                                                    <NavLink
                                                        key={idx}
                                                        to="#"
                                                        onClick={(event) =>
                                                            event.preventDefault()
                                                        }
                                                    >
                                                        <div
                                                            className={containerClass}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() =>
                                                                toggleSubMenu(v.value)
                                                            }
                                                        >
                                                            {v.value}
                                                        </div>
                                                    </NavLink>
                                                )}

                                                {openSubMenu === v.value &&
                                                    v.submenus &&
                                                    v.submenus.length > 0 && (
                                                        <ul
                                                            className="subitem-list"
                                                            onClick={(event) =>
                                                                event.stopPropagation()
                                                            }
                                                        >
                                                            {v.submenus.map(
                                                                (subItem, i) => (
                                                                    <li
                                                                        key={i}
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
                                                                        <NavLink
                                                                            className={
                                                                                current_page ===
                                                                                subItem.value
                                                                                    ? "sub-menu-current"
                                                                                    : ""
                                                                            }
                                                                            to={
                                                                                subItem.to ===
                                                                                "logout"
                                                                                    ? "?"
                                                                                    : subItem.to
                                                                            }
                                                                        >
                                                                            {
                                                                                subItem.value
                                                                            }
                                                                        </NavLink>
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
