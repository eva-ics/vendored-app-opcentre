import { useState, useMemo, useEffect, useRef, useReducer } from "react";
import { Coords } from "bmat/dom";
import {
    Chart,
    ChartKind,
    StateHistoryOIDColMapping,
    generateStateHistoryCSV,
    useEvaStateHistory,
} from "@eva-ics/webengine-react";
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
import { EvaErrorMessage } from "@eva-ics/webengine-react";
import { EvaError } from "@eva-ics/webengine";

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

const DEFAULT_CHART_COLOR = "#336699";

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
}

const chart_opts = {
    responsive: true,
    animations: false,
    plugins: {
        legend: {
            display: true,
            onClick: (e: any) => {
                e.preventDefault();
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
        update: 1,
        timeframe: "1H",
        database: "default",
        vfn: "mean",
    });
    const [prev_update, setPrevUpdate] = useState(1);

    const [items, setItems] = useState<Array<ChartItem>>([]);
    const [evaError, setEvaError] = useState<EvaError | undefined>(undefined);

    const hookProps = useMemo(() => {
        let oids: Array<string> = [];

        items.forEach((i) => {
            const oid = i.oid.trim();
            if (oid) {
                oids.push(oid);
            }
        });

        let args: any = {
            xopts: { vfn: props.vfn },
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

    // const options = useMemo(() => {
    //     return { ...chart_opts, scale: { y: { min: props.min, max: props.max } } };
    // }, [chart_opts, props.min, props.max]);

    const options = useMemo(() => {
        try {
            const timeframeInSeconds = Number(props.timeframe);
            const isLongInterval = timeframeInSeconds >= 604800;
            const timeUnit = isLongInterval ? "week" : "day";

            return {
                ...chart_opts,
                scales: {
                    y: {
                        min: props.min,
                        max: props.max,
                    },
                    x: {
                        type: "time",
                        time: {
                            unit: timeUnit,
                            stepSize: isLongInterval ? 1 : undefined,
                        },
                    },
                },
            };
        } catch (error) {
            let evaError: EvaError | undefined;

            if (error instanceof EvaError) {
                evaError = error;
            } else if (error instanceof Error) {
                evaError = {
                    code: -1,
                    message: error.message,
                };
            } else {
                evaError = {
                    code: -1,
                    message: "An unknown error occurred.",
                };
            }

            setEvaError(evaError);
            return { ...chart_opts }; // Return a fallback chart configuration
        }
    }, [chart_opts, props.min, props.max, props.timeframe]);

    // const options = useMemo(() => {
    //     try {
    //         const fillUnits = props.fill_units;
    //         const [startTimeString, endTimeString] = props.timeframe.split(":");
    //         const startTime = parseFloat(startTimeString) * 1000;
    //         const endTime = parseFloat(endTimeString) * 1000;
    //         const timeDifference = endTime - startTime;

    //         let unit = "minute";
    //         let stepSize = 0;

    //         if (fillUnits.endsWith("T")) {
    //             unit = "minute";
    //             stepSize = parseInt(fillUnits.replace("T", ""), 10);
    //         } else if (fillUnits.endsWith("H")) {
    //             unit = "hour";
    //             stepSize = parseInt(fillUnits.replace("H", ""), 10);
    //         }

    //         if (timeDifference > 1000 * 60 * 60 * 24 * 365 * 10) {
    //             //  If > 10 years
    //             setEvaError({
    //                 code: -1,
    //                 message:
    //                     "The selected time range is too large. Please select a range smaller than 10 years.",
    //             });
    //             return {};
    //         }
    //         if (timeDifference > 1000 * 60 * 60 * 24 * 365 * 5) {
    //             unit = "year";
    //             stepSize = 1; // 1 year step
    //             setEvaError(undefined);
    //         } else if (timeDifference > 1000 * 60 * 60 * 24 * 365) {
    //             // If > 1 year
    //             unit = "month";
    //             stepSize = 6; // Every 6 months
    //             setEvaError(undefined);
    //         } else if (timeDifference > 1000 * 60 * 60 * 24 * 30) {
    //             // If > 1 month
    //             unit = "day";
    //             stepSize = 7; // Every week
    //             setEvaError(undefined);
    //         } else if (timeDifference > 1000 * 60 * 60 * 24) {
    //             // If > 1 day
    //             unit = "hour";
    //             stepSize = 12; // Every 12 hours
    //             setEvaError(undefined);
    //         }

    //         return {
    //             ...chart_opts,
    //             scales: {
    //                 x: {
    //                     type: "time",
    //                     time: {
    //                         unit,
    //                         stepSize,
    //                     },
    //                 },
    //                 y: {
    //                     min: props.min,
    //                     max: props.max,
    //                 },
    //             },
    //         };
    //     } catch (error) {
    //         let evaError: EvaError | undefined;

    //         if (error instanceof EvaError) {
    //             evaError = error;
    //         } else if (error instanceof Error) {
    //             evaError = {
    //                 code: -1,
    //                 message: error.message,
    //             };
    //         } else {
    //             evaError = {
    //                 code: -1,
    //                 message: "An unknown error occurred.",
    //             };
    //         }

    //         setEvaError(evaError);
    //         return {};
    //     }
    // }, [chart_opts, props.min, props.max, props.fill_units, props.timeframe]);

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
                setter: setItems,
            },
            {
                name: "pu",
                value: prev_update,
                pack_json: true,
                setter: setPrevUpdate,
            },
        ],
        [props, items, prev_update]
    );

    if (!loaded) {
        return <></>;
    }

    // if (evaError) return <EvaErrorMessage error={evaError} />;

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
                                {prev_update > 0 && props.update == 0 ? (
                                    <ButtonStyled
                                        title="Start chart updates"
                                        variant="outlined"
                                        onClick={play}
                                    >
                                        <PlayArrowOutlinedIcon fontSize="small" />
                                    </ButtonStyled>
                                ) : null}
                                {props.update > 0 ? (
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
                            {evaError ? (
                                <EvaErrorMessage error={evaError} />
                            ) : (
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
                                    className="chart-trends"
                                    width={chartSize.current.x}
                                    height={chartSize.current.y}
                                    kind={props.kind}
                                />
                            )}
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
