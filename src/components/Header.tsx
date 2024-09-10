import { GiHamburgerMenu } from "react-icons/gi";
import { HeaderProps, NavElement } from "../types";
import { Eva } from "@eva-ics/webengine";
import { get_engine } from "@eva-ics/webengine-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Timestamp } from "bmat/time";

const TimeInfo = () => {
    const [time, setTime] = useState(new Date());
    const timeWorker = useRef<any>(null);
    useEffect(() => {
        if (!timeWorker.current) {
            timeWorker.current = setInterval(() => setTime(new Date()), 1000);
        }
        return () => {
            clearInterval(timeWorker.current);
            timeWorker.current = null;
        };
    }, []);
    const eva = get_engine() as Eva;
    return (
        <div className="time-info">
            ST: {new Timestamp(eva?.server_info?.time).toRFC3339()} CT:{" "}
            {new Timestamp(time).toRFC3339()}
        </div>
    );
};

const Header = ({ toggleMenu, nav, logout, current_page }: HeaderProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
    const submenuRefs = useRef<{ [key: string]: HTMLUListElement | null }>({});
    const navigate = useNavigate();

    const eva = get_engine() as Eva;

    // Handle clicks or keyboard events on main menu items
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
                setOpenSubMenu(openSubMenu === v.value ? null : v.value);
            } else {
                if (isShiftKey) {
                    if (v.to?.startsWith("?")) {
                        window.open(v.to, "_blank");
                    }
                } else {
                    if (v.to?.startsWith("?")) {
                        navigate(v.to);
                    }
                }
            }
        }
    };

    // Handle focus and keyboard events for main menu items
    const handleNavFocus = (event: React.FocusEvent<HTMLLIElement>) => {
        const target = event.target as HTMLLIElement;
        if (target && target.dataset.hasSubmenu === "true") {
            const submenu = target.querySelector(".submenu") as HTMLElement;
            if (submenu) {
                submenu.focus();
            }
        }
    };

    ////////////Sub//////////
    const handleSub = (event: any) => {
        if (event.target.tagName !== "A") {
            const link = event.currentTarget.querySelector("a");
            if (link) {
                link.click();
            }
        }
    };

    const handleSubClick = (
        event:
            | React.MouseEvent<HTMLAnchorElement, MouseEvent>
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
                const firstItem = submenu.querySelector("a");
                if (firstItem) {
                    firstItem.focus();
                }
            }
        }
    }, [openSubMenu]);

    return (
        <header className="header">
            <button className="menu-icon-btn" onClick={toggleMenu}>
                <GiHamburgerMenu size={25} />
            </button>
            <div className="header-info">
                <div className="dash-info">
                    <img src="icon.svg" className="dash-logo" />
                    <div className="dash-title">
                        EVA ICS System dashboard. Node: {eva.system_name()}{" "}
                        <span className="current-user">[{eva?.server_info?.aci.u}]</span>
                    </div>
                </div>
                <TimeInfo />
            </div>
            <nav id="header">
                <ul>
                    {nav.map((v, idx) => {
                        const isCurrent = current_page === v.value;

                        const navLinkClass = isCurrent
                            ? "nav-link nav-link-current"
                            : "nav-link";

                        const containerClass = isCurrent
                            ? "nav-link-container nav-link-container-current"
                            : "nav-link-container";

                        return (
                            <li
                                className={navLinkClass}
                                key={idx}
                                data-has-submenu={v.submenus && v.submenus.length > 0}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleNavClick(event, v);
                                }}
                                onFocus={handleNavFocus}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        handleNavClick(event, v);
                                    }
                                }}
                            >
                                {v.to ? (
                                    <NavLink key={idx} to={v.to}>
                                        <div className={containerClass}>{v.value}</div>
                                    </NavLink>
                                ) : (
                                    <NavLink
                                        key={idx}
                                        to="#"
                                        onClick={(event) => event.preventDefault()}
                                    >
                                        <div className={containerClass}>{v.value}</div>
                                    </NavLink>
                                )}

                                {openSubMenu == v.value &&
                                    v.submenus &&
                                    v.submenus.length > 0 && (
                                        <ul
                                            className="submenu"
                                            ref={(el) =>
                                                (submenuRefs.current[v.value] = el)
                                            }
                                        >
                                            {v.submenus.map((submenuItem, subIdx) => (
                                                <li
                                                    className="submenu-item"
                                                    key={subIdx}
                                                    onClick={handleSub}
                                                >
                                                    <NavLink
                                                        to={
                                                            submenuItem.to === "logout"
                                                                ? "?"
                                                                : submenuItem.to
                                                        }
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleSubClick(
                                                                event,
                                                                submenuItem.to
                                                            );
                                                        }}
                                                        onKeyDown={(event) =>
                                                            handleSubKeyDown(
                                                                event,
                                                                submenuItem.to
                                                            )
                                                        }
                                                    >
                                                        {submenuItem.value}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
