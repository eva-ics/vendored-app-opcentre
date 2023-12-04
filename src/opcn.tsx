import Layout from "./pages/Layout.tsx";
import { BrowserRouter } from "react-router-dom";
import { FunctionLogout, get_engine } from "@eva-ics/webengine-react";
import { useEffect } from "react";
import { DEFAULT_TITLE } from "./types/index.tsx";
import { Eva } from "@eva-ics/webengine";

const OpCentre = ({ logout }: { logout: FunctionLogout }) => {
  const eva = get_engine() as Eva;

  useEffect(() => {
    const system_name = eva.system_name();
    document.title = `${system_name} OpCentre`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  return (
    <BrowserRouter>
      <Layout logout={logout} />
    </BrowserRouter>
  );
};

export default OpCentre;
