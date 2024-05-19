import { useMemo } from "react";
import { get_engine, useEvaAPICall } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { timestampRFC3339, formatUptime } from "bmat/time";
import { useNavigate } from "react-router-dom";

const TOOLS = [
    {
        id: "idc",
        title: "Interactive dashboard creator",
        text: "Create custom dashboards with an interactive editor and no coding.",
        link: "IDC",
    },
    {
        id: "items",
        title: "Item browser",
        text: "Browse node items and watch their states using real-time charts.",
        link: "Items",
    },
    {
        id: "trends",
        title: "Trends",
        text: "Watch both real-time and archive item data using graphical charts. Multiple item trends can be combined on a single chart canvas.",
        link: "Trends",
    },
];

const CoreInfoRow = ({
    n,
    value,
    description,
}: {
    n: number;
    value: any;
    description: string;
}) => {
    return (
        <tr
            className={n % 2 === 0 ? "bmat-dashtable-row-even" : "bmat-dashtable-row-odd"}
        >
            <td>{description}</td>
            <td>{value}</td>
        </tr>
    );
};

const About = () => {
    return (
        <>
            <div className="bmat-dashtable-title">About the application</div>
            <div className="bmat-dashtable-container-inner">
                <div className="text-overview text-about">
                    <img src="i/face2.jpg" className="image-about" />
                    <ul className="about-list">
                        <li>
                            EVA ICS operation centre is a vendored web application which
                            allows to create custom dashboards, perform typical monitoring
                            and analytics tasks.
                        </li>
                        <li>
                            Application help and tutorials are available in{" "}
                            <a href="https://info.bma.ai/en/actual/eva4/va/opcentre.html">
                                Bohemia Automation InfoSys
                            </a>
                            .
                        </li>
                    </ul>
                </div>
            </div>
            <div className="text-overview text-about">
                <p>
                    &copy;{" "}
                    <a href="https://www.bohemia-automation.com/">
                        Bohemia Automation Limited
                    </a>
                    . All rights reserved. The application is available under{" "}
                    <a href="https://info.bma.ai/en/actual/eva4/license.html">
                        EVA ICS license
                    </a>{" "}
                    with no restrictions for both personal and commercial usage.
                </p>
            </div>
        </>
    );
};

const DashboardOverview = () => {
    const eva = useMemo(() => {
        return get_engine() as Eva;
    }, []);

    const navigate = useNavigate();

    const server_info = useEvaAPICall({
        method: "test",
        update: 1,
    },[]);

    const server_info_data = [
        ["Name", eva?.system_name()],
        ["Server time", timestampRFC3339(server_info?.data?.time)],
        ["Uptime", formatUptime(server_info?.data?.uptime)],
        ["Version/build", `${eva?.server_info?.version} ${eva?.server_info?.build}`],
    ];

    return (
        <div>
            <div className="dashboard-main-wrapper dashboard-main-wrapper-small">
                <div className="dashboard-main-wrapper-content">
                    <div className="dashboard-main-wrapper-content__side-left">
                        <div className="bmat-dashtable-container">
                            <div className="bmat-dashtable-title">System info</div>
                            <div className="bmat-dashtable-container-inner content-info">
                                <table className="info-table">
                                    <tbody>
                                        {server_info_data.map(([d, v], n) => {
                                            return (
                                                <CoreInfoRow
                                                    key={n}
                                                    n={n}
                                                    description={d}
                                                    value={v}
                                                />
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bmat-dashtable-container desktop-version">
                            <About />
                        </div>
                    </div>
                    <div className="dashboard-main-wrapper-content__side-right">
                        {TOOLS.map((t) => {
                            return (
                                <div className="bmat-dashtable-container" key={t.id}>
                                    <div className="bmat-dashtable-container-inner">
                                        <div>
                                            <div className="bmat-dashtable-title title-correct">
                                                {t.title}
                                            </div>
                                            <div className="overview-link-box">
                                                <div className="overview-button-container">
                                                    <button
                                                        className="overview-button-link "
                                                        onClick={() =>
                                                            navigate(`?d=${t.id}`)
                                                        }
                                                    >
                                                        {t.link}
                                                    </button>
                                                </div>
                                                <div className="text-overview text-inline">
                                                    {t.text.split("\n").map((str, i) => (
                                                        <p key={i}>{str}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="bmat-dashtable-container mobile-version">
                        <About />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
