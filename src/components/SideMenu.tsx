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

    const handleClick = (event: any, to: string) => {
        const isShiftKey = (event as React.KeyboardEvent<HTMLAnchorElement>).shiftKey;

        if (to === "logout") {
            logout();
        } else if (isShiftKey) {
            event.stopPropagation();
            event.preventDefault();
            setTimeout(() => window.open(to, "_blank"), 0);
        } else if (to.startsWith("/")) {
            document.location = to;
        } else {
            toggleMenu();
            navigate(to);
        }
    };

    const handleNavClick = (
        event:
            | React.MouseEvent<HTMLAnchorElement | HTMLLIElement>
            | React.KeyboardEvent<HTMLAnchorElement | HTMLLIElement>,
        v: NavElement
    ) => {
        if (
            event.type === "click" ||
            (event as React.KeyboardEvent<HTMLAnchorElement | HTMLLIElement>).key ===
                "Enter"
        ) {
            if (v.submenus && v.submenus.length > 0) {
                toggleSubMenu(v.value);
            } else if (v.to) {
                handleClick(event, v.to);
            }
        }
    };

    const handleSubKeyDown = (
        event: React.KeyboardEvent<HTMLAnchorElement>,
        to: string
    ) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick(event, to);
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
                                                                    <li key={i}>
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
                                                                            onClick={(
                                                                                event
                                                                            ) => {
                                                                                event.stopPropagation();
                                                                                handleClick(
                                                                                    event,
                                                                                    subItem.to
                                                                                );
                                                                            }}
                                                                            onKeyDown={(
                                                                                event
                                                                            ) =>
                                                                                handleSubKeyDown(
                                                                                    event,
                                                                                    subItem.to
                                                                                )
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
