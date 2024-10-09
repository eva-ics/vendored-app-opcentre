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
    const navigate = useNavigate();

    const eva = get_engine() as Eva;

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
                    event.preventDefault();
                    if (v.to?.startsWith("?")) {
                        setTimeout(() => window.open(v.to, "_blank"), 0);
                    } else if (v.to?.startsWith("/")) {
                        setTimeout(() => window.open(v.to, "_blank"), 0);
                    }
                } else {
                    if (v.to?.startsWith("?")) {
                        navigate(v.to);
                    } else if (v.to?.startsWith("/")) {
                        document.location = v.to;
                    }
                }
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
                setOpenSubMenu(null);
            }
        } else if (to.startsWith("/")) {
            event.preventDefault();
            if (isShiftKey) {
                setTimeout(() => window.open(to, "_blank"), 0);
            } else {
                document.location = to;
                setOpenSubMenu(null);
            }
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
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleNavClick(event, v);
                                }}
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
                                        <ul className="submenu">
                                            {v.submenus.map((submenuItem, subIdx) => (
                                                <li
                                                    key={subIdx}
                                                    className="submenu-item"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleSubClick(
                                                            event as React.MouseEvent<HTMLLIElement>,
                                                            submenuItem.to
                                                        );
                                                    }}
                                                    onKeyDown={(event) =>
                                                        handleSubKeyDown(
                                                            event as React.KeyboardEvent<HTMLLIElement>,
                                                            submenuItem.to
                                                        )
                                                    }
                                                >
                                                    <NavLink
                                                        to={
                                                            submenuItem.to === "logout"
                                                                ? "?"
                                                                : submenuItem.to
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
