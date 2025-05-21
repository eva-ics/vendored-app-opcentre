import { useState, useMemo, useEffect, useRef, useReducer } from "react";
import { Coords } from "bmat/dom";
import {
    Chart,
    ChartKind,
    StateHistoryOIDColMapping,
    generateStateHistoryCSV,
    useEvaStateHistory,
} from "@eva-ics/webengine-react";
import { Chart as ChartJs } from "chart.js";
// import { Chart, ChartKind } from "../idc/default_pack/chart.tsx";

import { StateProp } from "@eva-ics/webengine";
import { downloadCSV } from "bmat/dom";
import { EditNumber } from "../components/editors/number.tsx";
import { EditString } from "../components/editors/string.tsx";
import { EditFormula } from "../components/editors/formula.tsx";
import { EditSelectString } from "../components/editors/select_string.tsx";
import { EditSelectOID } from "../components/editors/select_oid.tsx";
import { EditSelectColor } from "../components/editors/select_color.tsx";
import { EditSelectDatabase } from "../components/editors/select_database.tsx";
import { calculateFormula } from "bmat/numbers";
import { useQueryParams } from "bmat/hooks";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { SelectPeriod } from "../components/editors/select_period.tsx";
import { Timestamp } from "bmat/time";
import { ButtonStyled } from "../common.tsx";
import ErrorBoundary from "../components/ErrorBoundary.tsx";
import { TextField } from "@mui/material";

type Timeout = ReturnType<typeof setTimeout>;

const MAX_CHART_WIDTH = 1150;

const calculateChartSize = (): Coords => {
    let w = window.innerWidth - 50;
    if (w > MAX_CHART_WIDTH) {
        w = MAX_CHART_WIDTH;
    }
    return { x: Math.round(w), y: Math.round(w / 2) };
};

const SET_DELAY = 500;

const VFN = ["mean", "sum"];

const CHART_KINDS = [ChartKind.Line, ChartKind.Bar];

const FILL_UNITS = ["A", "S", "T", "H", "D", "W"];
const FILL_UNIT_NAMES = ["point", "sec", "min", "hour", "day", "week"];

const getFillUnitName = (unit: string) => {
    return FILL_UNIT_NAMES[FILL_UNITS.indexOf(unit)];
};

const getFillUnitCode = (name: string) => {
    return FILL_UNITS[FILL_UNIT_NAMES.indexOf(name)];
};

const calculateTimeOffset = (labels: Array<number>): number => {
    const totalTimespan =
        new Date(labels[labels.length - 1]).getTime() - new Date(labels[0]).getTime();
    const averageInterval = totalTimespan / (labels.length - 1);
    const multiplier = Math.max(1, Math.log10(labels.length));
    return (averageInterval * multiplier) / 2;
};

const DEFAULT_CHART_COLOR = "#3366CC";

const CHART_COLORS_LIST = [
    "#3366CC",
    "#DC3912",
    "#FF9900",
    "#109618",
    "#990099",
    "#3B3EAC",
    "#0099C6",
    "#DD4477",
    "#66AA00",
    "#B82E2E",
    "#316395",
    "#994499",
    "#22AA99",
    "#AAAA11",
    "#6633CC",
    "#E67300",
    "#8B0707",
    "#329262",
    "#5574A6",
    "#3B3EAC",
];

interface ChartProps {
    kind: ChartKind;
    points: number;
    fill_units: string;
    digits: number;
    min?: number;
    max?: number;
    update: number;
    timeframe: string;
    database: string;
    vfn: string;
    rp?: string;
}

enum ChartItemProperty {
    oid = "oid",
    label = "label",
    formula = "formula",
    color = "color",
}

interface ChartItem {
    oid: string;
    label: string;
    formula: string;
    color: string;
    hidden: boolean;
}

const ChartItemEditor = ({
    id,
    item,
    setChartItemProp,
    deleteChartItem,
}: {
    id: number;
    item: ChartItem;
    setChartItemProp: (prop: ChartItemProperty, val: string) => void;
    deleteChartItem: () => void;
}) => {
    return (
        <div className="oids-form-wrapper">
            <div className="oids-form-wrapper-item">
                <p className="page-label">OID</p>
                <EditSelectOID
                    current_value={item.oid}
                    params={{ i: "#" }}
                    setParam={(val: string) =>
                        setChartItemProp(ChartItemProperty.oid, val)
                    }
                />
            </div>
            <div className="short-form-wrapper-item">
                <p className="page-label">Label</p>
                <EditString
                    element_id={`${id}-editlabel`}
                    current_value={item.label}
                    setParam={(val: string) =>
                        setChartItemProp(ChartItemProperty.label, val)
                    }
                />
            </div>
            <div className="short-form-wrapper-item">
                <p className="page-label">Formula</p>
                <EditFormula
                    element_id={`${id}-editlabel`}
                    current_value={item.formula}
                    setParam={(val: string) =>
                        setChartItemProp(ChartItemProperty.formula, val)
                    }
                />
            </div>
            <div className="oids-form-wrapper-item-color">
                <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                    <p className="page-label">Color</p>
                    <EditSelectColor
                        current_value={item.color}
                        width={120}
                        setParam={(val: string) =>
                            setChartItemProp(ChartItemProperty.color, val)
                        }
                    />
                </div>
                <div className="oids-form-wrapper-item">
                    <ButtonStyled variant="outlined" onClick={deleteChartItem}>
                        <RemoveIcon />
                    </ButtonStyled>
                </div>
            </div>
        </div>
    );
};

const downloadTrendsCSV = (items: ChartItem[], data: any) => {
    try {
        const mapping: StateHistoryOIDColMapping[] = items.map((i) => {
            return {
                oid: i.oid,
                name: i.label || i.oid,
                formula: i.formula,
            };
        });
        const content = generateStateHistoryCSV({ data: data, mapping });
        content ? downloadCSV(content, "trends.csv") : alert("No data available");
    } catch (err) {
        alert(err);
    }
};

const DashboardTrends = () => {
    const [props, setProps] = useState<ChartProps>({
        kind: ChartKind.Line,
        points: 60,
        fill_units: "A",
        digits: 5,
        update: 10,
        timeframe: "1H",
        database: "default",
        vfn: "mean",
        rp: "",
    });

    const [prev_update, setPrevUpdate] = useState(1);
    const [items, setItems] = useState<Array<ChartItem>>([]);
    const [error, setError] = useState<string | null>(null);
    const previousPropsRef = useRef<ChartProps>(props);

    const chart_opts = {
        responsive: true,
        animations: false,
        plugins: {
            legend: {
                display: true,
                onClick: (event: any, legendItem: any, legend: any) => {
                    let processed = false;
                    for (const item of items) {
                        if (
                            item.label === legendItem.text ||
                            (!item.label && item.oid === legendItem.text)
                        ) {
                            item.hidden = !item.hidden;
                            processed = true;
                        }
                    }
                    if (processed) {
                        setForceUpdateQs();
                    }
                    ChartJs.defaults.plugins.legend.onClick.call(
                        legend,
                        event,
                        legendItem,
                        legend
                    );
                },
            },
        },
        scales: {
            y: {
                min: undefined,
                max: undefined,
            },
        },
    };

    useEffect(() => {
        if (error) {
            const hasChanged = (Object.keys(props) as Array<keyof ChartProps>).some(
                (key) => props[key] !== previousPropsRef.current[key]
            );
            if (hasChanged) {
                const timeout = setTimeout(() => {
                    window.location.reload();
                }, 1000);

                return () => clearTimeout(timeout);
            }
        }
        previousPropsRef.current = props;
    }, [props, error]);

    const hookProps = useMemo(() => {
        let oids: Array<string> = [];

        items.forEach((i) => {
            const oid = i.oid.trim();
            if (oid) {
                oids.push(oid);
            }
        });

        let args: any = {
            xopts: {
                vfn: props.vfn,
                ...(props.rp !== "" ? { rp: props.rp } : {}),
            },
        };

        if (props.database) {
            args.database = props.database;
        }
        return {
            oid: oids,
            timeframe: props.timeframe,
            update: props.update || 86400 * 365 * 100,
            prop: StateProp.Value,
            fill: `${props.points}${props.fill_units || "A"}`,
            digits: props.digits,
            args: args,
        };
    }, [
        props.timeframe,
        props.update,
        props.digits,
        props.points,
        props.fill_units,
        props.database,
        props.vfn,
        props.rp,
        items,
    ]);

    const state = useEvaStateHistory(hookProps, [hookProps]);

    const size_sd = useRef<Timeout | undefined>(undefined);
    const props_sd = useRef<Timeout | undefined>(undefined);
    const props_sdata = useRef<ChartProps | null>(null);
    const items_sd = useRef<Timeout | undefined>(undefined);
    const items_sdata = useRef<Array<ChartItem> | null>(null);

    const chartSize = useRef<Coords>(calculateChartSize());
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const [forceUpdateQs, setForceUpdateQs] = useReducer((x) => x + 1, 0);

    const setItemsFromQS = (data: Array<ChartItem>) => {
        for (const item of data) {
            if (!item.color) {
                item.color = DEFAULT_CHART_COLOR;
            }
            if (item.formula === undefined) {
                item.formula = "x";
            }
            if (item.label === undefined) {
                item.label = "";
            }
        }
        setItems(data);
    };

    const setChartSizeModified = (val: Coords) => {
        if (val.x !== chartSize.current.x || val.y !== chartSize.current.y) {
            chartSize.current = val;
            forceUpdate();
        }
    };

    const handleResize = () => {
        clearTimeout(size_sd.current);
        size_sd.current = setTimeout(
            () => setChartSizeModified(calculateChartSize()),
            SET_DELAY
        );
    };

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const setPropsDelayed = (p: ChartProps) => {
        props_sdata.current = p;
        clearTimeout(props_sd.current);
        props_sd.current = setTimeout(() => {
            setProps(p);
            props_sdata.current = null;
        }, SET_DELAY);
    };

    const options = useMemo(() => {
        return {
            ...chart_opts,
            scales: {
                y: {
                    min: props.min,
                    max: props.max,
                },
                x: {
                    min: function (context: any) {
                        const labels = context.chart.data.labels;
                        const firstTime = labels[0];
                        const offset = calculateTimeOffset(labels);
                        return new Date(firstTime).getTime() - offset;
                    },
                    max: function (context: any) {
                        const labels = context.chart.data.labels;
                        const lastTime = labels[labels.length - 1];
                        const offset = calculateTimeOffset(labels);
                        return new Date(lastTime).getTime() + offset;
                    },
                },
            },
        };
    }, [chart_opts, props.min, props.max]);

    const labels = items.map((i) => i.label || i.oid);
    const formulas = items.map((i) => i.formula);
    const colors = items.map((i) => i.color);

    const setChartItemPropDelayed = (
        prop: ChartItemProperty,
        val: string,
        idx: number
    ) => {
        let ni = [...(items_sdata.current || items)];
        items_sdata.current = ni;
        ni[idx][prop] = val;
        clearTimeout(items_sd.current);
        items_sd.current = setTimeout(() => {
            setItems(ni);
            items_sdata.current = null;
        }, SET_DELAY);
    };

    const deleteChartItem = (idx: number) => {
        let ni = [...items];
        ni.splice(idx, 1);
        setItems(ni);
    };

    const getChartColor = () => {
        const item_colors = items.map((i) => i.color);
        for (const color of CHART_COLORS_LIST) {
            if (!item_colors.includes(color)) {
                return color;
            }
        }
        return DEFAULT_CHART_COLOR;
    };

    const addChartItem = () => {
        let ni = [...items];
        let chart_item: ChartItem = {
            oid: "",
            label: "",
            formula: "x",
            color: getChartColor(),
            hidden: false,
        };
        ni.push(chart_item);
        setItems(ni);
    };

    const loaded = useQueryParams(
        [
            {
                name: "props",
                value: props,
                pack_json: true,
                setter: (p: ChartProps) => {
                    setProps(p);
                    setPrevUpdate(p.update);
                },
            },
            {
                name: "items",
                value: items,
                pack_json: true,
                setter: setItemsFromQS,
            },
            {
                name: "pu",
                value: prev_update,
                pack_json: true,
                setter: setPrevUpdate,
            },
        ],
        [props, items, prev_update, forceUpdateQs]
    );

    if (!loaded) {
        return <></>;
    }

    const play = () => {
        setProps({ ...props, update: prev_update });
    };

    const pause = (p: ChartProps) => {
        setPrevUpdate(p.update);
        setProps({ ...p, update: 0 });
    };

    const setTimeframe = (a: string) => {
        const np = { ...(props_sdata.current || props), timeframe: a };
        if (a.includes(":") && np.update) {
            setPrevUpdate(np.update);
            np.update = 0;
        }
        setPropsDelayed(np);
    };

    const datasetOptions = (i: any): Object => {
        return {
            hidden: items[i]?.hidden,
            animations: false,
        };
    };

    return (
        <div>
            <div className="dashboard-main-wrapper">
                <div className="dashboard-main-wrapper-content">
                    <div className="trends-container">
                        <div className="page-title">Trends</div>
                        <div className="form-list-wrapper">
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Update</p>
                                <div>
                                    <EditNumber
                                        element_id="trends-update"
                                        current_value={props.update}
                                        update_key={props.update}
                                        setParam={(n: number) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                update: n,
                                            });
                                        }}
                                        params={{ min: 0 }}
                                        // size
                                    />
                                </div>
                                {!error && prev_update > 0 && props.update == 0 ? (
                                    <ButtonStyled
                                        title="Start chart updates"
                                        variant="outlined"
                                        onClick={play}
                                    >
                                        <PlayArrowOutlinedIcon fontSize="small" />
                                    </ButtonStyled>
                                ) : null}
                                {error || props.update > 0 ? (
                                    <ButtonStyled
                                        variant="outlined"
                                        title="Pause chart updates"
                                        onClick={() => pause(props)}
                                    >
                                        <PauseOutlinedIcon fontSize="small" />
                                    </ButtonStyled>
                                ) : null}
                            </div>
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Digits</p>
                                <div>
                                    <EditNumber
                                        element_id="trends-digits"
                                        current_value={props.digits}
                                        setParam={(n: number) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                digits: n,
                                            });
                                        }}
                                        params={{ min: 0 }}
                                    />
                                </div>
                            </div>
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Fill</p>
                                <div>
                                    <EditNumber
                                        element_id="trends-points"
                                        current_value={props.points}
                                        setParam={(n: number) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                points: n,
                                            });
                                        }}
                                        params={{ min: 1, max: 1000 }}
                                    />
                                </div>
                                <div>
                                    <EditSelectString
                                        current_value={getFillUnitName(
                                            props.fill_units || "A"
                                        )}
                                        setParam={(n: string) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                fill_units: getFillUnitCode(n),
                                            });
                                        }}
                                        params={FILL_UNIT_NAMES}
                                    />
                                </div>
                            </div>
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Fn</p>
                                <div>
                                    <EditSelectString
                                        current_value={props.vfn}
                                        setParam={(n: string) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                vfn: n,
                                            });
                                        }}
                                        params={VFN}
                                    />
                                </div>
                            </div>

                            <div className="form-list-wrapper-item">
                                <p className="page-label">Kind</p>
                                <div>
                                    <EditSelectString
                                        current_value={props.kind}
                                        setParam={(n: string) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                kind: n as ChartKind,
                                            });
                                        }}
                                        params={CHART_KINDS}
                                    />
                                </div>
                            </div>
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Min</p>
                                <div>
                                    <EditNumber
                                        element_id="trends-update"
                                        current_value={props.min as any}
                                        update_key={props.min}
                                        setParam={(n: number) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                min: n,
                                            });
                                        }}
                                        params={{ allow_undefined: true }}
                                        size
                                    />
                                </div>
                            </div>
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Max</p>
                                <div>
                                    <EditNumber
                                        element_id="trends-update"
                                        current_value={props.max as any}
                                        update_key={props.max}
                                        setParam={(n: number) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                max: n,
                                            });
                                        }}
                                        params={{ allow_undefined: true }}
                                        size
                                    />
                                </div>
                            </div>
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Period</p>
                                <div>
                                    <SelectPeriod
                                        element_id="trends-period"
                                        current_value={props.timeframe}
                                        setParam={setTimeframe}
                                    />
                                </div>
                            </div>
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Database</p>
                                <div className="form-select-database">
                                    <EditSelectDatabase
                                        current_value={props.database}
                                        setParam={(s: string) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                database: s,
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="form-list-wrapper-item">
                                <p className="page-label">Rp</p>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    value={props.rp}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        setPropsDelayed({
                                            ...(props_sdata.current || props),
                                            rp: e.target.value,
                                        });
                                    }}
                                    fullWidth
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            padding: "3px 6px",
                                            fontSize: "12px",
                                        },
                                    }}
                                />
                            </div>
                            <div className="form-list-wrapper-item">
                                <ButtonStyled
                                    title="Download CSV"
                                    variant="outlined"
                                    disabled={!state?.data}
                                    onClick={() => {
                                        downloadTrendsCSV(items, state.data);
                                    }}
                                >
                                    <FileDownloadOutlinedIcon fontSize="small" />
                                </ButtonStyled>
                                <ButtonStyled
                                    title="Print"
                                    variant="outlined"
                                    disabled={!state?.data}
                                    onClick={() => {
                                        window.print();
                                    }}
                                >
                                    <PrintOutlinedIcon fontSize="small" />
                                </ButtonStyled>
                            </div>
                        </div>
                        <div
                            style={{
                                display: hookProps.oid.length === 0 ? "none" : "block",
                            }}
                        >
                            <ErrorBoundary setError={setError}>
                                <Chart
                                    oid={hookProps.oid}
                                    state={state}
                                    timeframe={props.timeframe}
                                    formula={formulas}
                                    fill={`${props.points}A`}
                                    digits={props.digits}
                                    update={props.update || 86400}
                                    labels={labels}
                                    colors={colors}
                                    options={options}
                                    dataset_options={datasetOptions}
                                    className="chart-trends"
                                    width={chartSize.current.x}
                                    height={chartSize.current.y}
                                    kind={props.kind}
                                />
                            </ErrorBoundary>
                        </div>
                        <div className="trends-editor">
                            <div>
                                {items.map((item, i) => {
                                    return (
                                        <ChartItemEditor
                                            key={i}
                                            id={i}
                                            item={item}
                                            deleteChartItem={() => deleteChartItem(i)}
                                            setChartItemProp={(
                                                prop: ChartItemProperty,
                                                val: string
                                            ) => setChartItemPropDelayed(prop, val, i)}
                                        />
                                    );
                                })}
                            </div>
                            <ButtonStyled
                                variant="outlined"
                                sx={{ marginTop: "20px" }}
                                onClick={addChartItem}
                            >
                                <AddIcon />
                            </ButtonStyled>
                        </div>

                        <DataTable props={props} items={items} data={state.data} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DataTable = ({
    items,
    data,
    props,
}: {
    items: ChartItem[];
    data: any;
    props: ChartProps;
}) => {
    const getValue = (item: ChartItem, idx: number) => {
        const tf = data[0];
        if (tf) {
            const vals = tf[`${item.oid}/value`];
            if (vals) {
                return (calculateFormula(item.formula, vals[idx]) as number)?.toFixed(
                    props.digits
                );
            }
        }
    };

    return data ? (
        <table className="trends-values">
            <thead>
                <tr>
                    <th className="col-fit">Time</th>
                    {items.map((item, i) => (
                        <th key={i}>{item.label || item.oid}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.t.map((t: number, idx: number) => (
                    <tr key={idx}>
                        <td className="col-fit">{new Timestamp(t).toRFC3339()}</td>
                        {items.map((item, i) => (
                            <td className="col-fit" key={i}>
                                {getValue(item, idx)}
                            </td>
                        ))}
                        <td> </td>
                    </tr>
                ))}
            </tbody>
        </table>
    ) : null;
};

export default DashboardTrends;
