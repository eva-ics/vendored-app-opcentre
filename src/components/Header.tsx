import { GiHamburgerMenu } from "react-icons/gi";
import { HeaderProps } from "../types";
import { Eva } from "@eva-ics/webengine";
import { get_engine } from "@eva-ics/webengine-react";
import { NavLink } from "react-router-dom";

const Header = ({ toggleMenu, nav, logout, current_page }: HeaderProps) => {
    const eva = get_engine() as Eva;

    return (
        <header className="header">
            <button className="menu-icon-btn" onClick={toggleMenu}>
                <GiHamburgerMenu size={25} />
            </button>
            <div className="header-info">
                <div className="dash-info">
                    <img src="icon.svg" className="dash-logo" />
                    <div className="dash-title">
                        EVA ICS OpCentre. Node: {eva.system_name()} [
                        {eva?.server_info?.aci.u}]
                    </div>
                </div>
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
                            <li className={navLinkClass} key={idx}>
                                <NavLink key={idx} to={v.to}>
                                    <div className={containerClass}>{v.value}</div>
                                </NavLink>

                                {isCurrent && v.submenus && v.submenus.length > 0 && (
                                    <ul className="submenu">
                                        {v.submenus.map((submenuItem, subIdx) => (
                                            <li className="submenu-item" key={subIdx}>
                                                <NavLink
                                                    to={submenuItem.to}
                                                    onClick={() =>
                                                        submenuItem.to === "logout" &&
                                                        logout()
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
