import { useState, useEffect } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import { LayoutProps } from "../types";
import { useSearchParams } from "react-router-dom";
import DashboardOverview from "../pages/Overview.tsx";
import DashboardItems from "../pages/Items.tsx";
import DashboardAlarmState from "../pages/AlarmState.tsx";
import DashboardAlarmHistory from "../pages/AlarmHistory.tsx";
import DashboardDataObjects from "../pages/DataObjects.tsx";
import DashboardTrends from "../pages/Trends.tsx";
import DashboardIDC from "../pages/IDC.tsx";
import DashboardLL from "../pages/LL.tsx";
import { element_pack, ElementKind } from "../idc/default_pack";
import { v4 as uuidv4 } from "uuid";
import { DashboardData, DashboardEditor, DashboardViewer } from "idc-core";
import { get_engine, useEvaAPICall } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { ElementClass } from "idc-core";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import {
    onSuccess,
    onError,
    onEvaError,
    formatDashboardPath,
    defaultIDCDashboard,
    onActionSuccess,
    onActionFail,
    DEFAULT_ALARM_SVC,
} from "../common";
import Profile from "./Profile.tsx";
import * as EvaWE from "@eva-ics/webengine";
import * as EvaWER from "@eva-ics/webengine-react";

const allowedDashboardChars = /^[a-zA-Z0-9 ._-]+$/;

const AlarmSummary = () => {
    const [method, setMethod] = useState<string | undefined>(
        `x::${DEFAULT_ALARM_SVC}::summary`
    );
    const summary = useEvaAPICall(
        {
            method,
            update: 1,
        },
        [method]
    );
    if (summary?.data?.active > 0) {
        return (
            <div className="alarm-count">
                <NotificationsActiveIcon style={{ fontSize: 16 }} /> {summary.data.active}
            </div>
        );
    } else {
        if (summary.error?.code == -32113 && method) {
            // service not registered
            setMethod(undefined);
        }
        return <></>;
    }
};

const updateElementPack = async () => {
    const eva = get_engine() as Eva;
    const res_clipart = await eva.call("pvt.list", "vendored-apps/opcentre/idc/clipart", {
        recursive: true,
        kind: "file",
    });
    const c = element_pack.classes;
    if (Array.isArray(res_clipart) && res_clipart.length > 0) {
        const image_class = element_pack.classes.get(ElementKind.Image) as ElementClass;
        const props = image_class.props.filter(
            (p) => p.name != "image" && p.name != "update"
        );
        const defaults: any = { ...image_class.defaults };
        defaults.width = 200;
        delete defaults.image;
        delete defaults.update;
        res_clipart.forEach((r: any) => {
            const parts = r.path.split("/");
            const group = parts[0];
            const n = parts[1];
            const l = n.lastIndexOf(".");
            const name = n.substring(0, l);
            if (name.startsWith("_")) return;
            const elc_id = `clipart/${group}/${name}`;
            const img_uri = `/pvt/vendored-apps/opcentre/idc/clipart/${r.path}`;
            //const img_uri = `${eva.api_uri}/pvt/vendored-apps/opcentre/idc/clipart/${r.path}?k=${eva.api_token}`;
            const elc: ElementClass = {
                description: `${name}`,
                group: `Clipart/${group}`,
                default_zIndex: 5,
                IconDraw: () => <img width="30" src={img_uri} alt={elc_id} />,
                defaults,
                vendored: {
                    image: img_uri,
                },
                props,
                default_size: { x: 20, y: 20 },
                boxed: true,
                actions: false,
            };
            c.set(elc_id, elc);
        });
    }
    const res_elements = await eva.call(
        "pvt.list",
        "vendored-apps/opcentre/idc/elements",
        {
            recursive: false,
            kind: "file",
        }
    );
    if (Array.isArray(res_elements) && res_elements.length > 0) {
        window.React = React;
        (window as any).$eva.external.uuidv4 = uuidv4;
        (window as any).EvaWE = EvaWE;
        (window as any).EvaWER = EvaWER;
        const jobs = [];
        for (const r of res_elements) {
            jobs.push(importCustomElement(r));
        }
        await Promise.all(jobs).catch((e) => {
            console.error(`Error loading element modules: ${e}`);
        });
    }
};

const importCustomElement = async (el: any) => {
    const n = el.path;
    const l = n.lastIndexOf(".");
    const module_name: string = `idce_${n.substring(0, l)}`;
    try {
        console.debug(`Loading element module ${el.path}`);
        const mod_uri = `/pvt/vendored-apps/opcentre/idc/elements/${el.path}`;
        //const mod_uri = `${(window as any).$eva.api_uri}/pvt/vendored-apps/opcentre/idc/elements/${el.path}?k=${(window as any).$eva.api_token}`;
        await import(/* @vite-ignore */mod_uri);
        const mod: any = window[module_name as any];
        const module: Map<string, ElementClass> = mod?.default ? mod.default : mod;
        if (!module) {
            throw new Error(`Module ${module_name} not loaded`);
        }
        if (!(module instanceof Map)) {
            throw new Error(`Module ${module_name} export is not a map`);
        }
        for (const [k, v] of module) {
            console.debug(`Loaded element class ${k}`);
            element_pack.classes.set(k, v);
        }
    } catch (e) {
        console.error(`Error loading element module ${el.path}: ${e}`);
    }
};

enum ElementPackUpdated {
    No,
    Pending,
    Yes,
}

const Layout = ({ logout }: LayoutProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [isElementPackUpdated, setElementPackUpdated] = useState(ElementPackUpdated.No);
    const [searchParams, _] = useSearchParams();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [currentDashboard, setCurrentDashboard] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setDashboardData(null);
        if (!currentDashboard) {
            setDashboardData(defaultIDCDashboard());
        } else {
            (get_engine() as Eva)
                .call("pvt.get", formatDashboardPath(currentDashboard))
                .then((r) => setDashboardData(JSON.parse(r.content)))
                .catch((e) => onEvaError(e));
        }
    }, [currentDashboard]);

    const toggleMenu = () => {
        setIsOpenMenu(!isOpenMenu);
    };

    const saveIDC = async (data: DashboardData) => {
        const name = data.name.trim();
        if (!name) {
            onError("please set the dashboard name");
            return false;
        }
        if (!allowedDashboardChars.test(name)) {
            onError("invalid characters in dashboard name");
            return false;
        }
        try {
            await (get_engine() as Eva).call("pvt.put", formatDashboardPath(data.name), {
                content: JSON.stringify(data),
            });
            onSuccess("dashboard saved");
            return true;
        } catch (e: any) {
            onEvaError(e);
            return false;
        }
    };

    const finishIDC = () => {
        get_engine()
            ?.set_state_updates(false, true)
            .then(() => {
                setDashboardData(null);
                setCurrentDashboard(null);
                navigate("?d=idc");
            });
    };

    let content;
    let current_page;

    document.body.style.overscrollBehavior = "auto";

    switch (searchParams.get("d")) {
        case "idc":
            if (isElementPackUpdated != ElementPackUpdated.Yes) {
                if (isElementPackUpdated == ElementPackUpdated.No) {
                    setElementPackUpdated(ElementPackUpdated.Pending);
                    updateElementPack()
                        .then(() => setElementPackUpdated(ElementPackUpdated.Yes))
                        .catch(() => setElementPackUpdated(ElementPackUpdated.Yes));
                }
                return <div className="d-idc-preparing">Loading custom elements...</div>;
            }

            const i = searchParams.get("i");
            switch (searchParams.get("m")) {
                case "view":
                    if (currentDashboard !== i) setCurrentDashboard(i);
                    if (dashboardData) {
                        return (
                            <>
                                <DashboardViewer
                                    element_pack={element_pack}
                                    session_id={uuidv4()}
                                    finish={finishIDC}
                                    onActionSuccess={onActionSuccess}
                                    onActionFail={onActionFail}
                                    data={dashboardData}
                                    body_color="#222"
                                />
                            </>
                        );
                    } else {
                        return (
                            <div className="d-idc-preparing">Preparing dashboard...</div>
                        );
                    }
                case "edit":
                    if (currentDashboard !== i) setCurrentDashboard(i);
                    if (dashboardData) {
                        document.body.style.overscrollBehaviorY = "none";
                        return (
                                <DashboardEditor
                                    element_pack={element_pack}
                                    session_id={uuidv4()}
                                    offsetX={0}
                                    offsetY={0}
                                    save={saveIDC}
                                    finish={finishIDC}
                                    onSuccess={onSuccess}
                                    onError={onError}
                                    data={dashboardData}
                                />
                        );
                    } else {
                        return (
                            <div className="d-idc-preparing">Preparing dashboard...</div>
                        );
                    }
                default:
                    content = <DashboardIDC />;
                    current_page = "IDC";
                    break;
            }
            break;
        case "items":
            content = <DashboardItems />;
            current_page = "Items";
            break;
        case "trends":
            content = <DashboardTrends />;
            current_page = "Trends";
            break;
        case "dobj":
            content = <DashboardDataObjects />;
            current_page = "Data objects";
            break;
        case "ll":
            content = <DashboardLL />;
            current_page = "Logic";
            break;
        case "profile":
            content = <Profile logout={logout} />;
            current_page = "Profile";
            break;
        case "navigate":
            content = <DashboardOverview />;
            current_page = "Navigate";
            break;
        case "main_app":
            content = <DashboardOverview />;
            current_page = "Main app";
            break;
        case "alarm_state":
            content = <DashboardAlarmState />;
            current_page = "Alarms";
            break;
        case "alarm_history":
            content = <DashboardAlarmHistory />;
            current_page = "Alarms";
            break;
        default:
            current_page = "Overview";
            content = <DashboardOverview />;
    }

    const nav = [
        { value: "Overview", to: "?" },
        { value: "IDC", to: "?d=idc" },
        { value: "Items", to: "?d=items" },
        {
            value: (
                <>
                    Alarms
                    <AlarmSummary />
                </>
            ),
            compare_value: "Alarms",
            submenus: [
                { value: "States", to: "?d=alarm_state" },
                { value: "History", to: "?d=alarm_history" },
            ],
        },
        { value: "Data objects", to: "?d=dobj" },
        { value: "Logic", to: "?d=ll" },
        { value: "Trends", to: "?d=trends" },
        {
            value: "Navigate",
            submenus: [
                { value: "Main app", to: "/" },
                { value: "Vendored apps", to: "/va/" },
                { value: "Profile", to: "?d=profile" },
                { value: "Logout", to: "logout" },
            ],
        },
    ];

    return (
        <div className="root-container">
            <Header
                toggleMenu={toggleMenu}
                nav={nav}
                logout={logout}
                current_page={current_page}
            />
            <SideMenu
                nav={nav}
                isOpen={isOpenMenu}
                toggleMenu={toggleMenu}
                logout={logout}
                current_page={current_page}
            />
            {content}
        </div>
    );
};

export default Layout;
