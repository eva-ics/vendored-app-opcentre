import { useEffect, useRef, useState } from "react";
import { NavElement, SideMenuProps } from "../types";
import { AiOutlineClose } from "react-icons/ai";
import { NavLink, useNavigate } from "react-router-dom";

const SideMenu = ({ nav, isOpen, toggleMenu, logout, current_page }: SideMenuProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const submenuRefs = useRef<{ [key: string]: HTMLUListElement | null }>({});
    const navigate = useNavigate();

    const toggleSubMenu = (menuItem: string) => {
        setOpenSubMenu(openSubMenu === menuItem ? null : menuItem);
    };

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
                    if (v.to?.startsWith("?")) {
                        window.open(v.to, "_blank");
                    }
                } else {
                    if (v.to) {
                        navigate(v.to);
                    }
                }
                toggleMenu();
            }
        }
    };

    // Handle focus and keyboard events for main menu items
    const handleNavFocus = (
        event: React.FocusEvent<HTMLAnchorElement | HTMLLIElement>
    ) => {
        const target = event.target as HTMLLIElement | HTMLAnchorElement;
        if (target.dataset.hasSubmenu === "true") {
            const submenu = target.querySelector(".subitem-list") as HTMLElement;
            if (submenu) {
                submenu.focus({ preventScroll: true });
            }
        }
    };

    const handleSubClick = (
        event:
            | React.MouseEvent<HTMLAnchorElement>
            | React.KeyboardEvent<HTMLAnchorElement>,
        to: string
    ) => {
        const isShiftKey = (event as React.KeyboardEvent<HTMLAnchorElement>).shiftKey;

        if (to === "logout") {
            logout();
        } else if (to.startsWith("?")) {
            if (isShiftKey) {
                window.open(to, "_blank");
            } else {
                navigate(to);
                toggleMenu();
            }
        }
    };

    const handleSubKeyDown = (
        event: React.KeyboardEvent<HTMLAnchorElement>,
        to: string
    ) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSubClick(event, to);
        }
    };

    useEffect(() => {
        if (openSubMenu) {
            const submenu = submenuRefs.current[openSubMenu];
            if (submenu) {
                submenu.focus({ preventScroll: true });
            }
        }
    }, [openSubMenu]);

    return (
        <>
            {isOpen ? (
                <div className="side-menu-wrapper open">
                    <div className="backdrop">
                        <div className="menu-container">
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
                                                data-has-submenu={
                                                    v.submenus && v.submenus.length > 0
                                                }
                                                // tabIndex={0}
                                                onClick={() => toggleSubMenu(v.value)}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key === "Enter" ||
                                                        event.key === " "
                                                    ) {
                                                        handleNavClick(event, v);
                                                    }
                                                }}
                                                onFocus={handleNavFocus}
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
                                                        onFocus={handleNavFocus}
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
                                                            ref={(el) =>
                                                                (submenuRefs.current[
                                                                    v.value
                                                                ] = el)
                                                            }
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
                                                                                handleSubClick(
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
