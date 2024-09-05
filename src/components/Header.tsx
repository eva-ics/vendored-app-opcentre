import { GiHamburgerMenu } from "react-icons/gi";
import { HeaderProps } from "../types";
import { Eva } from "@eva-ics/webengine";
import { get_engine } from "@eva-ics/webengine-react";
import { NavLink } from "react-router-dom";
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

    const eva = get_engine() as Eva;

    const handleSubClick = (event: any) => {
        if (event.target.tagName !== "A") {
            const link = event.currentTarget.querySelector("a");
            if (link) {
                link.click();
            }
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
                                onClick={() => {
                                    if (
                                        v.submenus &&
                                        v.submenus.length > 0 &&
                                        openSubMenu !== v.value
                                    ) {
                                        setOpenSubMenu(v.value);
                                    } else {
                                        setOpenSubMenu(null);
                                        if (v.to?.startsWith("/")) {
                                            document.location = v.to;
                                        }
                                    }
                                }}
                            >
                                {v.to ? (
                                    <NavLink key={idx} to={v.to}>
                                        <div className={containerClass}>{v.value}</div>
                                    </NavLink>
                                ) : (
                                    <div className={containerClass}>{v.value}</div>
                                )}

                                {openSubMenu == v.value &&
                                    v.submenus &&
                                    v.submenus.length > 0 && (
                                        <ul className="submenu">
                                            {v.submenus.map((submenuItem, subIdx) => (
                                                <li
                                                    className="submenu-item"
                                                    key={subIdx}
                                                    onClick={handleSubClick}
                                                >
                                                    <NavLink
                                                        to={
                                                            submenuItem.to === "logout"
                                                                ? "?"
                                                                : submenuItem.to
                                                        }
                                                        onClick={() => {
                                                            if (
                                                                submenuItem.to.startsWith(
                                                                    "/"
                                                                )
                                                            ) {
                                                                document.location =
                                                                    submenuItem.to;
                                                            } else if (
                                                                submenuItem.to ===
                                                                "logout"
                                                            ) {
                                                                logout();
                                                            }
                                                        }}
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
