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
                                <ul className="side-menu-list">
                                    {nav.map((v, idx) => {
                                        const isCurrent = current_page === v.value;
                                        const containerClass = isCurrent
                                            ? "side-menu-current"
                                            : "side-menu-item";

                                        return (
                                            <li key={idx}>
                                                {v.to ? (
                                                    <NavLink
                                                        to={v.to}
                                                        onClick={() => {
                                                            toggleSubMenu(v.value);
                                                            toggleMenu();
                                                            if (v.to?.startsWith("/")) {
                                                                document.location = v.to;
                                                            }
                                                        }}
                                                    >
                                                        <div className={containerClass}>
                                                            {v.value}
                                                        </div>
                                                    </NavLink>
                                                ) : (
                                                    <div
                                                        className={containerClass}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() =>
                                                            toggleSubMenu(v.value)
                                                        }
                                                    >
                                                        {v.value}
                                                    </div>
                                                )}

                                                {openSubMenu === v.value &&
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
                                                                                subItem.to ===
                                                                                "logout"
                                                                                    ? "?"
                                                                                    : subItem.to
                                                                            }
                                                                            onClick={() => {
                                                                                if (
                                                                                    subItem.to.startsWith(
                                                                                        "/"
                                                                                    )
                                                                                ) {
                                                                                    document.location =
                                                                                        subItem.to;
                                                                                } else if (
                                                                                    subItem.to ===
                                                                                    "logout"
                                                                                ) {
                                                                                    logout();
                                                                                    toggleMenu();
                                                                                } else {
                                                                                    toggleMenu();
                                                                                }
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
