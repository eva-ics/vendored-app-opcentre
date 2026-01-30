import { GiHamburgerMenu } from "react-icons/gi";
import { HeaderProps, NavElement } from "../types";
import { Eva } from "@eva-ics/webengine";
import { get_engine } from "@eva-ics/webengine-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Timestamp } from "bmat/time";
import { BookmarkButton } from "./BookmarkButton";
import { AlarmSummary } from "../pages/Layout.tsx";

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
    const submenuRef = useRef<HTMLUListElement>(null);
    const location = useLocation();

    const eva = get_engine() as Eva;

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
        } else if (to.startsWith("/")) {
            if (isShiftKey) {
                setTimeout(() => window.open(to, "_blank"), 0);
            } else {
                document.location = to;
            }
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
        <header className="header">
            <div className="header-top">
                <button className="menu-icon-btn" onClick={toggleMenu}>
                    <GiHamburgerMenu size={25} />
                </button>
                <div className="header-info">
                    <div className="dash-info">
                        <img src="icon.svg" className="dash-logo" />
                        <div className="dash-title">
                            EVA ICS System dashboard.Node: {eva.system_name()}
                            <span className="current-user">
                                [{eva?.server_info?.aci.u}]
                            </span>
                            <div className="alarm-summary-header">
                            <AlarmSummary alwaysDisplay={true} />
                            </div>
                        </div>
                    </div>
                    <TimeInfo />
                </div>
                <BookmarkButton
                    className={
                        location.search === "?d=bookmarks"
                            ? "invisible"
                            : "header-bookmark"
                    }
                />
            </div>
            <nav id="header">
                <ul>
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
                                className={
                                    isCurrent ? "nav-link nav-link-current" : "nav-link"
                                }
                                key={idx}
                                onClick={(event) => {
                                    if (!v.to) event.preventDefault();
                                    handleNavClick(event, v);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        handleNavClick(event, v);
                                    }
                                }}
                                onBlur={handleBlur}
                            >
                                <a
                                    href={v.to || "#"}
                                    className={
                                        isCurrent
                                            ? "nav-link-container nav-link-container-current"
                                            : "nav-link-container"
                                    }
                                >
                                    {v.value}
                                </a>

                                {openSubMenu == v.value &&
                                    v.submenus &&
                                    v.submenus.length > 0 && (
                                        <ul className="submenu" ref={submenuRef}>
                                            {v.submenus.map((submenuItem, subIdx) => (
                                                <li
                                                    key={subIdx}
                                                    className={
                                                        location.search === submenuItem.to
                                                            ? "submenu-item-current"
                                                            : "submenu-item"
                                                    }
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleSubClick(
                                                            event as React.MouseEvent<HTMLLIElement>,
                                                            submenuItem.to
                                                        );
                                                    }}
                                                    onKeyDown={(event) => {
                                                        handleSubKeyDown(
                                                            event as React.KeyboardEvent<HTMLLIElement>,
                                                            submenuItem.to
                                                        );
                                                    }}
                                                >
                                                    <a
                                                        href={
                                                            submenuItem.to === "logout"
                                                                ? "#"
                                                                : submenuItem.to
                                                        }
                                                    >
                                                        {submenuItem.value}
                                                    </a>
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
