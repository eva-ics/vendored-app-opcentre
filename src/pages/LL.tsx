import { useState, useEffect } from "react";
import { onEvaError } from "../common";
import { get_engine, useEvaAPICall, EvaErrorMessage } from "@eva-ics/webengine-react";
import { Eva } from "@eva-ics/webengine";
import { useQueryParams } from "bmat/hooks";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { TextField } from "@mui/material";
import { ButtonStyled } from "../common.tsx";
import { RackView, type Step } from "logicline-view";
import "../../node_modules/logicline-view/dist/style.css";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import AdvancedModalDialog from "../components/mui/AdvancedModalDialog.tsx";

const DashboardIDC = () => {
    const [controllers, setControllers] = useState([]);
    const [activeController, setActiveController] = useState("");
    const [lineFilter, setLineFilter] = useState("");
    const [lineFilterInputValue, setLineFilterInputValue] = useState(lineFilter ?? "");
    const [stepInfoOpen, setStepInfoOpen] = useState(false);
    const [stepInfo, setStepInfo] = useState<Step | null>(null);

    const snapshotRes = useEvaAPICall(
        {
            method: activeController ? `x::${activeController}::ll.snapshot` : undefined,
            update: 1,
            params: { line_filter: lineFilter },
        },
        [activeController, lineFilter]
    );

    const infoRes = useEvaAPICall(
        {
            method: activeController ? `x::${activeController}::ll.info` : undefined,
            update: 1,
        },
        [activeController]
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
                setter: (v) => {
                    setLineFilter(v);
                    setLineFilterInputValue(v);
                },
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

    const saveLineFilterValue = () => {
        if (lineFilterInputValue !== lineFilter) {
            setLineFilter(lineFilterInputValue);
        }
    };

    let view = null;
    if (snapshotRes.data?.lines && Object.keys(snapshotRes.data.lines).length > 0) {
        view = (
            <div style={{ marginTop: 20 }}>
                <RackView
                    data={snapshotRes.data}
                    onBlockClick={(v: Step) => {
                        setStepInfo({
                            name: v.name,
                            input: <pre>{JSON.stringify(v.input, null, 2)}</pre>,
                        });
                        setStepInfoOpen(true);
                    }}
                />
            </div>
        );
    } else if (snapshotRes.data && !snapshotRes.data.lines && !snapshotRes.error) {
        view = <div>No data</div>;
    }

    let rec_btn = null;
    if (infoRes.data) {
        rec_btn = (
            <div style={{ padding: 5 }}>
                <div style={{ display: "inline-block", marginRight: 10, width: 190 }}>
                    State recording:{" "}
                    <div style={{ display: "inline", minWidth: 300, fontWeight: "bold" }}>
                        {infoRes.data.recording ? (
                            <span className="rec-active">ACTIVE</span>
                        ) : (
                            "STOPPED"
                        )}
                    </div>
                </div>
                <ButtonStyled
                    variant="outlined"
                    onClick={() => {
                        get_engine()!
                            .call(`x::${activeController}::ll.set_recording`, {
                                recording: !infoRes.data.recording,
                            })
                            .catch(onEvaError);
                    }}
                >
                    {infoRes.data.recording ? (
                        <PauseOutlinedIcon />
                    ) : (
                        <PlayArrowOutlinedIcon />
                    )}
                </ButtonStyled>
            </div>
        );
    }

    return (
        <div>
            <div className="dashboard-main-wrapper dashboard-main-wrapper-big">
                <div className="dashboard-main-wrapper-content">
                    <div className="dashboard-main-wrapper-content__side-left">
                        <div className="bmat-dashtable-container">
                            <div className="bmat-dashtable-container-inner">
                                <div className="form-list-wrapper" style={{ padding: 5 }}>
                                    <div className="form-list-wrapper-item">
                                        <p className="page-label">Controller</p>
                                        <Select
                                            className="ll-controller-select"
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
                                    </div>
                                    <div className="form-list-wrapper-item">
                                        <p className="page-label">Line</p>
                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            value={lineFilterInputValue}
                                            onChange={(e) =>
                                                setLineFilterInputValue(e.target.value)
                                            }
                                            onBlur={saveLineFilterValue}
                                            onKeyDown={(
                                                e: React.KeyboardEvent<HTMLInputElement>
                                            ) => {
                                                if (e.key === "Enter") {
                                                    saveLineFilterValue();
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                            placeholder="line filter"
                                            fullWidth
                                            sx={{
                                                "& .MuiInputBase-root": {
                                                    padding: "3px 6px",
                                                    fontSize: "12px",
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                                <EvaErrorMessage error={snapshotRes.error} />
                                {rec_btn}
                                {view}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AdvancedModalDialog
                title={`Step ${stepInfo?.name} input`}
                open={stepInfoOpen}
                content={stepInfo?.input}
                onClose={() => setStepInfoOpen(false)}
            />
        </div>
    );
};

export default DashboardIDC;
