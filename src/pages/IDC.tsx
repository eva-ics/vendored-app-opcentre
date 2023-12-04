import { DashTable, DashTableFilter, DashTableData } from "bmat/dashtable";
import { copyTextClipboard } from "bmat/dom";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useReducer } from "react";
import ModalDialog from "../components/mui/ModalDialog.tsx";
import { formatDashboardPath, onEvaError, onSuccess, onError } from "../common";
import CachedIcon from "@mui/icons-material/Cached";
import { get_engine } from "@eva-ics/webengine-react";
import { Eva, EvaError } from "@eva-ics/webengine";
import { useQueryParams } from "bmat/hooks";

const DashboardIDC = () => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [dashboards, setDashboards] = useState([]);
  const [force, forceUpdate] = useReducer((x) => x + 1, 0);
  const [nameFilter, setNameFilter] = useState("");
  const navigate = useNavigate();

  useQueryParams(
    [
      {
        name: "name",
        value: nameFilter,
        setter: setNameFilter,
        pack_json: false
      }
    ],
    [nameFilter]
  );

  useEffect(() => {
    setDashboards([]);
    (get_engine() as Eva)
      .call("pvt.list", formatDashboardPath(), {
        masks: "*.json",
        kind: "file",
        recursive: true
      })
      .then((r) => {
        setDashboards(r);
      })
      .catch((e) => onEvaError(e));
  }, [force]);

  const engine = get_engine() as Eva;

  const filter: DashTableFilter = [
    [
      "Filter:",
      <input
        size={15}
        value={nameFilter}
        onChange={(e) => setNameFilter(e.target.value)}
      />
    ],
    [
      "",
      <div className="idc-btns-container">
        <button className="idc-button btn-with-text btn-correct"
          onClick={() => {
            navigate(`?d=idc&i=&m=edit`);
          }}
        >
             
          <AddBoxIcon style={{ fontSize: 15 }} />
            new dashboard
      
        </button>
        <button onClick={forceUpdate} className="idc-button">
         <CachedIcon style={{ fontSize: 16 }}  />
         </button>
      </div>
    ]
  ];

  const closeModal = () => {
    setConfirmDelete(null);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      const path = formatDashboardPath(confirmDelete);
      engine
        .call("pvt.unlink", path)
        .then(() => {
          forceUpdate();
          onSuccess(`dashboard deleted: ${confirmDelete}`);
        })
        .catch((e: EvaError) => onEvaError(e));
      setConfirmDelete(null);
    }
  };

  const data: DashTableData = dashboards
    .filter((d: any) => {
      return d.path.slice(0, -5).includes(nameFilter);
    })
    .map((d: any) => {
      const name = d.path.slice(0, -5);
      const viewURL = `?d=idc&i=${name}&m=view`;
      const editURL = `?d=idc&i=${name}&m=edit`;
      return {
        data: [
          {
            value: (
              <a
                href={viewURL}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(viewURL);
                }}
              >
                {name}
              </a>
            ),
            sort_value: name
          },
          {
            value: <button onClick={() => navigate(viewURL)}>view</button>,
            className: "col-fit"
          },
          {
            value: (
              <button
                onClick={() => {
                  const url =
                    window.location.origin + window.location.pathname + viewURL;
                  copyTextClipboard(url)
                    .then(() => onSuccess(`dashboard URL copied:\n${url}`))
                    .catch((e) => onError(e));
                }}
              >
                copy URL
              </button>
            ),
            className: "col-fit"
          },
          {
            value: <button onClick={() => navigate(editURL)}>edit</button>,
            className: "col-fit"
          },
          {
            value: (
              <button
                className="btn-delete"
                onClick={() => setConfirmDelete(name)}
              >
                delete
              </button>
            ),
            className: "col-fit"
          }
        ]
      };
    });

  return (
    <div>
      <div className="dashboard-main-wrapper dashboard-main-wrapper-big">
        <div className="dashboard-main-wrapper-content">
          <div className="dashboard-main-wrapper-content__side-left">
            <DashTable
              id="idc"
              title="Interactive dashboard creator"
              cols={["dashboard", "", "", "", ""]}
              filter={filter}
              data={data}
              className="content-longtable table-items"
              rememberQs={true}
            />
          </div>
        </div>
      </div>
      {confirmDelete ? (
        <ModalDialog
          open
          title={`Delete the dashboard "${confirmDelete}"?`}
          onClose={closeModal}
          onConfirm={handleDelete}
        />
      ) : null}
    </div>
  );
};

export default DashboardIDC;
