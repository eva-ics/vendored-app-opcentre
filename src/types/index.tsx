import { FunctionLogout } from "@eva-ics/webengine-react";

export interface SideMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  logout: FunctionLogout;
  nav: Array<NavElement>
  current_page: string;
}

export interface LayoutProps {
  logout: FunctionLogout;
}

export interface HeaderProps {
  toggleMenu: () => void;
  logout: FunctionLogout;
  current_page: string;
  nav: Array<NavElement>
}

export interface NavElement {
  value: any;
  to: string;
}

export const DEFAULT_TITLE = "OpCentre";
