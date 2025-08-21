import { BrowserRouter } from "react-router-dom";
import { FunctionLogout } from "@eva-ics/webengine-react";
import Layout from "./pages/Layout.tsx";

const OpCentre = ({ logout }: { logout: FunctionLogout }) => {
    return (
        <BrowserRouter>
            <Layout logout={logout} />
        </BrowserRouter>
    );
};

export default OpCentre;
