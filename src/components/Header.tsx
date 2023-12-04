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
            let class_name = "nav-link";
            let class_name_container = "nav-link-container";
            if (current_page == v.value) {
              class_name += " nav-link-current";
              class_name_container += " nav-link-container-current";
            }
            return (
              <li className={class_name} key={idx}>
                <NavLink key={idx} to={v.to}>
                  <div className={class_name_container}>{v.value}</div>
                </NavLink>
              </li>
            );
          })}
          <li className="nav-link" style={{ marginLeft: "30px" }}>
            <NavLink
              onClick={() => {
                logout();
              }}
              to="?"
            >
              <div className="nav-link-container">Logout</div>
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
