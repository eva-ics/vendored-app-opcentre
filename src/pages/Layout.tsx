import { useState, useEffect } from "react";
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
import { element_pack } from "../idc/default_pack";
import { v4 as uuidv4 } from "uuid";
import { DashboardData, DashboardEditor, DashboardViewer } from "idc-core";
import { get_engine, useEvaAPICall } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
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

const Layout = ({ logout }: LayoutProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
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

    switch (searchParams.get("d")) {
        case "idc":
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
                        document.body.style.overscrollBehavior = "contain";
                        return (
                            <>
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
                            </>
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

    document.body.style.overscrollBehavior = "auto";

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
