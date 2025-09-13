import ReactDOM from "react-dom/client";
import OpCentre from "./opcn.tsx";
import "./sass/main.scss";
import "../node_modules/idc-core/dist/style.css";
import "./idc/default_pack/style.css";
import { Eva, IntervalKind, disableTabFreeze } from "@eva-ics/webengine";
import { set_engine, LoginProps, HMIApp } from "@eva-ics/webengine-react";
import { DEFAULT_TITLE } from "./types/index.tsx";
import "chartjs-adapter-date-fns";
import React from "react";
import { encode, decode } from "@msgpack/msgpack";
import ToasterProvider from "./components/ToastsProvider.tsx";

import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
    BarElement,
    BarController,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    BarElement,
    BarController
);

disableTabFreeze();

const eva = new Eva();
eva.external.msgpack = { decode, encode };
set_engine(eva);
document.title = DEFAULT_TITLE;

const login_props: LoginProps = {
    cache_login: true,
    cache_auth: true,
    register_globals: true,
};

eva.load_config().then((_config: any) => {
    eva.state_updates = false;
    eva.set_interval(IntervalKind.Heartbeat, 1);
    ReactDOM.createRoot(document.getElementById("root")!).render(
        <>
            <React.StrictMode>
                <ToasterProvider />
                <HMIApp Dashboard={OpCentre} login_props={login_props} />
            </React.StrictMode>
        </>
    );
});
