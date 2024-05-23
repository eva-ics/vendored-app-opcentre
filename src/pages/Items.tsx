import { useState, useMemo, useCallback, useReducer, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { DashTable, DashTableFilter, DashTableData } from "bmat/dashtable";
import { timestampRFC3339 } from "bmat/time";
import { copyTextClipboard } from "bmat/dom";
import { useQueryParams } from "bmat/hooks";
import { get_engine, useEvaStateUpdates, useEvaAPICall } from "@eva-ics/webengine-react";
import { Eva, ItemState } from "@eva-ics/webengine";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { ButtonStyled } from "../common.tsx";

const item_kinds = ["", "+", "lvar", "sensor", "unit", "#"];

const watch_opts = {
    responsive: true,
    animations: false,
    plugins: {
        legend: {
            display: false,
        },
    },
    scales: {
        y: {
            type: "linear",
            display: true,
            position: "left",
        },
        x: {
            type: "time",
            time: {
                unit: "second",
                unitStepSize: 1,
                round: "second",
                tooltipFormat: "HH:mm:ss",
            },
            ticks: {
                maxTicksLimit: 8,
                maxRotation: 0,
                autoSkip: true,
                callback: function (value: any, index: number, values: Array<any>): any {
                    if (index === values.length - 1) {
                        return "";
                    } else {
                        return (this as any).getLabelForValue(value).split(" ");
                    }
                },
            },
        },
    },
};

const formatItemList = (kind: string, full_id: string): Array<string> => {
    switch (kind) {
        case "#":
            return ["#"];
        case "":
            return [];
        default:
            return full_id ? [`${kind}:${full_id}`] : [];
    }
};

const formatValue = (val: any) => {
    if (val === null || val === undefined) {
        return "";
    }
    if (Array.isArray(val) || typeof val == "object") {
        return JSON.stringify(val);
    }
    return val;
};

const formatClassName = (state: ItemState, mark_err?: boolean) => {
    if (!state.connected) {
        return "item-state-disconnected";
    }
    if (state.status && state.status < 0 && mark_err) {
        return "item-state-error";
    }
    return "";
};

const DrawSetTime = ({ state }: { state: ItemState }) => {
    return (
        <span className={formatClassName(state)}>
            {state.t ? timestampRFC3339(state.t) : ""}
        </span>
    );
};

const DrawStatus = ({ state }: { state: ItemState }) => {
    return <span className={formatClassName(state, true)}>{state.status}</span>;
};

const DrawValue = ({ state }: { state: ItemState }) => {
    return (
        <span className={formatClassName(state, true)}>{formatValue(state.value)}</span>
    );
};

const WATCH_VALUES = 60;
const SAMPLING_INTERVAL = 1;

interface ShortState {
    status: number | null;
    value: number | null;
}

const ItemWatch = ({ oid, unwatch }: { oid: string; unwatch: (oid: string) => void }) => {
    const [states, setStates] = useState<ShortState[]>(
        Array(WATCH_VALUES).fill({ status: null, value: null })
    );
    const [sampleTime, setSampleTime] = useState(new Date());

    const sampleData = useCallback(() => {
        const eva = get_engine() as Eva;
        let st = [...states];
        st.shift();
        const state = eva.state(oid) as ItemState;
        if (state) {
            st.push({
                status:
                    state.status === undefined || state?.status === null
                        ? null
                        : state.status,
                value: parseFloat(state.value),
            });
        } else {
            st.push({
                status: null,
                value: null,
            });
        }
        setStates(st);
        setSampleTime(new Date());
    }, [states, oid, unwatch]);

    useEffect(() => {
        const interval = setInterval(() => sampleData(), SAMPLING_INTERVAL * 1000);
        return () => {
            clearInterval(interval);
        };
    }, [sampleData]);

    const data = useMemo(() => {
        const color = "#99CCFF";
        let labels = [];
        for (let i = states.length; i > 0; i--) {
            labels.push(new Date(sampleTime.getTime() - i * SAMPLING_INTERVAL * 1000));
        }
        return {
            labels: labels,
            datasets: [
                {
                    data: states.map((s) => s.value),
                    borderColor: color,
                    backgroundColor: color,
                    fill: false,
                    pointRadius: 2,
                },
            ],
        };
    }, [states, sampleTime]);

    return (
        <>
            <div className="item-watch-container">
                <button
                    className="item-watch-chart-close-button"
                    onClick={() => unwatch(oid)}
                >
                    x
                </button>
                <div className="item-watch-chart-title">{oid}</div>
                <Line data={data} options={watch_opts as any} />
                <div className="item-watch-chart-state">
                    s: {states[59].status}, v: {states[59].value}
                </div>
            </div>
        </>
    );
};

interface ItemStateParams {
    i: Array<string>;
}

const DashboardItems = () => {
    const [params, setParams] = useState({
        kind: "",
        full_id: "",
    });

    const [callParams, setCallParams] = useState<ItemStateParams>({ i: [] });

    const [watchedItems, setWatchedItems] = useState<string[]>([]);

    const [_, setForceUpdate] = useReducer((x) => x + 1, 0);

    const setFullId = (s: string) => {
        const i = s.trim();
        if ((i == "#" || i == "*") && !params.kind) {
            setItemsParams({ kind: "#", full_id: "" });
        } else {
            const pos = i.indexOf(":");
            if (pos == -1) {
                setItemsParams({ full_id: i });
            } else {
                let kind = i.slice(0, pos);
                if (!item_kinds.includes(kind)) {
                    kind = "";
                }
                const full_id = i.slice(pos + 1);
                setItemsParams({ kind: kind, full_id: full_id });
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => setForceUpdate(), 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEvaStateUpdates(
        {
            state_updates: watchedItems,
            clear_existing: true,
        },
        [watchedItems]
    );

    const setItemsParams = (p: object) => {
        let np: any = { ...params };
        Object.keys(p).forEach((k) => {
            np[k] = (p as any)[k];
        });
        setParams(np);
        setCallParams({ i: formatItemList(np.kind, np.full_id) });
    };

    const formatOID = () => {
        switch (params.kind) {
            case "#":
            case "":
                return params.kind;
            default:
                return `${params.kind}:${params.full_id}`;
        }
    };

    const copyOID = useCallback(() => {
        copyTextClipboard(formatOID()).catch((e) => alert(e));
    }, [formatOID]);

    const loaded = useQueryParams(
        [
            {
                name: "oid",
                value: formatOID(),
                setter: setFullId,
            },
            {
                name: "watch",
                value: watchedItems,
                encoder: (s: Array<string>) => s.join(","),
                decoder: (s: string) => s.split(",").filter((i) => i),
                setter: setWatchedItems,
            },
        ],
        [params, watchedItems]
    );

    const states = useEvaAPICall(
        {
            method: loaded ? "item.state" : undefined,
            params: callParams,
            update: 1,
        },
        [loaded, callParams]
    );

    const filter: DashTableFilter = [
        [
            "OID",
            <select
                value={params.kind}
                onChange={(e) => setItemsParams({ kind: e.target.value })}
            >
                {item_kinds.map((v) => (
                    <option key={v}>{v}</option>
                ))}
            </select>,
        ],
        [
            ":",
            <>
                <input
                    size={45}
                    value={params.full_id || ""}
                    onChange={(e) => setFullId(e.target.value)}
                />
                <ButtonStyled variant="outlined" onClick={copyOID}>
                    <ContentCopyIcon style={{ fontSize: 15 }} />
                </ButtonStyled>
                <ButtonStyled
                    variant="outlined"
                    onClick={() =>
                        window.open("https://info.bma.ai/en/actual/eva4/items.html#oid")
                    }
                >
                    <HelpOutlineIcon style={{ fontSize: 15 }} />
                </ButtonStyled>
                <div style={{ display: "inline", marginLeft: 20 }}></div>
                <ButtonStyled variant="outlined" onClick={window.print}>
                    <PrintOutlinedIcon style={{ fontSize: 15 }} />
                </ButtonStyled>
            </>,
        ],
    ];

    const watchItem = (oid: string) => {
        if (!watchedItems.includes(oid)) {
            setWatchedItems([...watchedItems, oid]);
        }
    };

    const unwatchItem = useCallback(
        (oid: string) => {
            const pos = watchedItems.indexOf(oid);
            if (pos !== -1) {
                let w = [...watchedItems];
                w.splice(pos, 1);
                setWatchedItems(w);
            }
        },
        [watchedItems]
    );

    const data: DashTableData = states?.data?.map((state: any) => {
        return {
            data: [
                { value: state.oid, className: "col-fit " + formatClassName(state) },
                { value: state.node, className: "col-fit " + formatClassName(state) },
                {
                    value: <DrawSetTime state={state} />,
                    sort_value: state.t,
                    className: "col-fit",
                },
                {
                    value: (
                        <div className="print-hidden">
                            <button onClick={() => setFullId(state.oid)}>filter</button>
                        </div>
                    ),
                    className: "col-fit",
                },
                {
                    value: (
                        <div className="print-hidden">
                            <button
                                className="print-hidden"
                                disabled={!state.connected}
                                onClick={() => watchItem(state.oid)}
                            >
                                watch
                            </button>
                        </div>
                    ),
                    className: "col-fit",
                },
                {
                    value: <DrawStatus state={state} />,
                    className: "col-fit",
                    sort_value: state.status,
                },
                {
                    value: <DrawValue state={state} />,
                    className: "item-state-value",
                    sort_value: state.value,
                },
            ],
        };
    });

    const watched = watchedItems.map((oid) => {
        return <ItemWatch key={oid} oid={oid} unwatch={unwatchItem} />;
    });

    const header = <div className="item-watch">{watched}</div>;

    return (
        <div>
            <div className="dashboard-main-wrapper dashboard-main-wrapper-big">
                <div className="dashboard-main-wrapper-content">
                    <div className="dashboard-main-wrapper-content__side-left">
                        <DashTable
                            id="items"
                            title="Items"
                            cols={["oid", "node", "set time", "", "", "status", "value"]}
                            header={header}
                            filter={filter}
                            data={data}
                            className="content-longtable table-items"
                            rememberQs={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardItems;
