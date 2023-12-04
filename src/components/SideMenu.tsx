import { SideMenuProps } from "../types";
import { AiOutlineClose } from "react-icons/ai";
import { NavLink } from "react-router-dom";

const SideMenu = ({ nav, isOpen, toggleMenu, logout, current_page }: SideMenuProps) => {

  
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
                <ul>
                  {nav.map((v, idx) => {
                    return (
                      <li key={idx} >
                        <NavLink className={current_page===v.value?"side-menu-current":""} onClick={() => toggleMenu()} to={v.to}>
                          {v.value}
                        </NavLink>
                      </li>
                    );
                  })}
                  <li style={{ marginTop: "30px" }}>
                    <NavLink
                      onClick={() => {
                        toggleMenu();
                        logout();
                      }}
                      to="?"
                    >
                      Logout
                    </NavLink>
                  </li>
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
