import { useState } from "react";
import { SideMenuProps } from "../types";
import { AiOutlineClose } from "react-icons/ai";
import { NavLink } from "react-router-dom";

const SideMenu = ({ nav, isOpen, toggleMenu, logout, current_page }: SideMenuProps) => {
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    const toggleSubMenu = (menuItem: string) => {
        openSubMenu === menuItem ? setOpenSubMenu(null) : setOpenSubMenu(menuItem);
    };

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
                                            <li key={idx}>
                                                <NavLink
                                                    className={
                                                        current_page === v.value
                                                            ? "side-menu-current"
                                                            : ""
                                                    }
                                                    onClick={() => toggleSubMenu(v.value)}
                                                    to={v.to}
                                                >
                                                    {v.value}
                                                </NavLink>

                                                {openSubMenu &&
                                                    current_page === v.value &&
                                                    v.submenus &&
                                                    v.submenus.length > 0 && (
                                                        <ul className="subitem-list">
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
                                                                                subItem.to
                                                                            }
                                                                            onClick={() => {
                                                                                handleClickMenu(
                                                                                    subItem.value,
                                                                                    subItem.to
                                                                                );
                                                                            }}
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
