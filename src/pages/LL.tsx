import { useState, useEffect } from "react";
import { onEvaError } from "../common";
import { get_engine, useEvaAPICall } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { useQueryParams } from "bmat/hooks";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { TextField } from "@mui/material";
import { RackView, type Snapshot, type Step } from "logicline-view";
import "../../node_modules/logicline-view/dist/style.css";

const DashboardIDC = () => {
    const [controllers, setControllers] = useState([]);
    const [activeController, setActiveController] = useState("");
    const [lineFilter, setLineFilter] = useState("");
    const [lineFilterInputValue, setLineFilterInputValue] = useState(lineFilter ?? "");

    const snapshotRes = useEvaAPICall(
        {
            method: `x::${activeController}::ll.snapshot`,
            update: 1,
            params: { line_filter: lineFilter },
        },
        [activeController, lineFilter]
    );

    useQueryParams(
        [
            {
                name: "c",
                value: activeController,
                setter: setActiveController,
                pack_json: false,
            },
            {
                name: "lf",
                value: lineFilter,
                setter: setLineFilter,
                pack_json: false,
            },
        ],
        [activeController, lineFilter]
    );

    useEffect(() => {
        setControllers([]);
        (get_engine() as Eva)
            .call("llc.list")
            .then((r) => {
                setControllers(r.map((c: any) => c.id));
            })
            .catch((e) => {
                if (e.code !== -32001) onEvaError(e);
            });
    }, []);

    return (
        <div>
            <div className="dashboard-main-wrapper dashboard-main-wrapper-big">
                <div className="dashboard-main-wrapper-content">
                    <div className="dashboard-main-wrapper-content__side-left">
                        <Select
                            className="idc-editor-select"
                            value={activeController}
                            onChange={(e) => {
                                setActiveController(e.target.value || "");
                            }}
                        >
                            {controllers?.map((v, i) => (
                                <MenuItem key={i} value={v}>
                                    {v}
                                </MenuItem>
                            ))}
                        </Select>
                        <TextField
                            fullWidth
                            type="text"
                            value={lineFilter}
                            // size={params?.size}
                            onChange={(e) => {
                                setLineFilter(e.target.value);
                            }}
                        />
                        {snapshotRes.data ? (
                            <>
                                <RackView data={snapshotRes.data} />
                            </>
                        ) : (
                            <div>No data</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardIDC;
