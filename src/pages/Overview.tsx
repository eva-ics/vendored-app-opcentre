import { useMemo } from "react";
import { get_engine, useEvaAPICall } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { timestampRFC3339, formatUptime } from "bmat/time";
import { useNavigate } from "react-router-dom";

const TOOLS = [
  {
    id: "idc",
    title: "Interactive dashboard creator",
    text: "IDC allows operators to create custom dashboards with an interactive editor and no coding."
  },
  {
    id: "items",
    title: "Item browser",
    text: "The tool allows to browse node items and watch their states using real-time charts."
  },
  {
    id: "trends",
    title: "Trends",
    text: "Trends tool allows to watch both real-time and archive item data using graphical charts.\nMultiple item trends can be combined on a single chart canvas."
  }
];

const CoreInfoRow = ({
  n,
  value,
  description
}: {
  n: number;
  value: any;
  description: string;
}) => {
  return (
    <tr
      className={
        n % 2 === 0 ? "bmat-dashtable-row-even" : "bmat-dashtable-row-odd"
      }
    >
      <td>{description}</td>
      <td>{value}</td>
    </tr>
  );
};

const DashboardOverview = () => {
  const eva = useMemo(() => {
    return get_engine() as Eva;
  }, []);

  const navigate = useNavigate();

  const server_info = useEvaAPICall({
    method: "test",
    update: 1
  });

  const server_info_data = [
    ["Name", eva?.system_name()],
    ["Server time", timestampRFC3339(server_info?.data?.time)],
    ["Uptime", formatUptime(server_info?.data?.uptime)],
    ["Version/build", `${eva?.server_info?.version} ${eva?.server_info?.build}`]
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
                        <CoreInfoRow key={n} n={n} description={d} value={v} />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bmat-dashtable-container desktop-version">
              <div className="bmat-dashtable-title">About the application</div>
              <div className="bmat-dashtable-container-inner">
                <div className="text-overview text-about">
                  <img src="i/face_transparent.png" className="image-about" />
                  <ul className="about-list">
                  <li>
                    EVA ICS operation centre is a vendored web application which
                    allows operators to create custom dashboards, perform
                    typical monitoring and analytics tasks.
                  </li>
                  <li>
                    More information, help and tutorials can be found at the
                    application page in{" "}
                    <a href="https://info.bma.ai/en/actual/eva4/va/opcentre.html">
                      Bohemia Automation Information System
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
            </div>
          </div>
          <div className="dashboard-main-wrapper-content__side-right">
            {TOOLS.map((t) => {
              return (
                <div className="bmat-dashtable-container" key={t.id}>
                  <div className="bmat-dashtable-container-inner">
                    <div>
                      <div className="bmat-dashtable-title">{t.title}</div>
                      <div className="info-overview">
                        <div className="image-overview">
                          <img
                            src={`i/${t.id}.svg`}
                            onClick={() => navigate(`?d=${t.id}`)}
                          />
                        </div>
                        <div className="text-overview">
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
          <div className="bmat-dashtable-container mobile-version"  >
              <div className="bmat-dashtable-title">About the application</div>
              <div className="bmat-dashtable-container-inner">
                <div className="text-overview text-about">
                  <img src="i/face_transparent.png" className="image-about" />
                  <ul className="about-list">
                  <li>
                    EVA ICS operation centre is a vendored web application which
                    allows operators to create custom dashboards, perform
                    typical monitoring and analytics tasks.
                  </li>
                  <li>
                    More information, help and tutorials can be found at the
                    application page in{" "}
                    <a href="https://info.bma.ai/en/actual/eva4/va/opcentre.html">
                      Bohemia Automation Information System
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
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
