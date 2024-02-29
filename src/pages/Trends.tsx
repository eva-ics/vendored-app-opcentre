import { useState, useMemo, useEffect, useRef, useReducer } from "react";
import { Coords } from "bmat/dom";
import {
    LineChart,
    StateHistoryOIDColMapping,
    generateStateHistoryCSV,
} from "@eva-ics/webengine-react";
import { downloadCSV } from "bmat/dom";
import { EditNumber } from "../components/editors/number.tsx";
import { EditString } from "../components/editors/string.tsx";
import { EditFormula } from "../components/editors/formula.tsx";
import { EditSelectNumber } from "../components/editors/select_number.tsx";
import { EditSelectOID } from "../components/editors/select_oid.tsx";
import { EditSelectColor } from "../components/editors/select_color.tsx";
import { EditSelectDatabase } from "../components/editors/select_database.tsx";
import { rangeArray } from "bmat/numbers";
import { useQueryParams } from "bmat/hooks";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { SelectPeriod } from "../components/editors/select_period.tsx";
import { Button, styled } from "@mui/material";

type Timeout = ReturnType<typeof setTimeout>;

const MAX_CHART_WIDTH = 1150;

let current_data: any = null;

const calculateChartSize = (): Coords => {
    let w = window.innerWidth - 50;
    if (w > MAX_CHART_WIDTH) {
        w = MAX_CHART_WIDTH;
    }
    return { x: Math.round(w), y: Math.round(w / 2) };
};

const SET_DELAY = 500;

//mui styles
const ButtonTrend = styled(Button)({
    borderColor: "gray",
    color: "gray",
    padding: "5px",
    minWidth: "40px",
});

const POINTS = rangeArray(10, 120, 10);

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
    points: number;
    digits: number;
    min?: number;
    max?: number;
    update: number;
    timeframe: string;
    database: string;
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
                    <ButtonTrend variant="outlined" onClick={deleteChartItem}>
                        <RemoveIcon />
                    </ButtonTrend>
                </div>
            </div>
        </div>
    );
};

const downloadTrendsCSV = (items: ChartItem[]) => {
    try {
        const mapping: StateHistoryOIDColMapping[] = items.map((i) => {
            return {
                oid: i.oid,
                name: i.label || i.oid,
                formula: i.formula,
            };
        });
        const content = generateStateHistoryCSV({ data: current_data, mapping });
        content ? downloadCSV(content, "trends.csv") : alert("No data available");
    } catch (err) {
        alert(err);
    }
};

const DashboardTrends = () => {
    const [props, setProps] = useState<ChartProps>({
        points: 60,
        digits: 5,
        update: 1,
        timeframe: "1H",
        database: "default",
    });

    const [items, setItems] = useState<Array<ChartItem>>([]);

    const [prev_update, setPrevUpdate] = useState(1);

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

    const options = useMemo(() => {
        return { ...chart_opts, scale: { y: { min: props.min, max: props.max } } };
    }, [chart_opts, props.min, props.max]);

    const args = useMemo(() => {
        let args: any = {};
        if (props.database) {
            args.database = props.database;
        }
        return args;
    }, [props.database]);

    let oids: Array<string> = [];

    items.forEach((i) => {
        const oid = i.oid.trim();
        if (oid) {
            oids.push(oid);
        }
    });

    const labels = items.map((i) => i.label || i.oid);
    const formulas = items.map((i) => i.formula);
    const colors = items.map((i) => i.color);
    const timeframe = props.timeframe;

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
        current_data = null;
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

    return (
        <div>
            <div className="dashboard-main-wrapper">
                <div className="dashboard-main-wrapper-content">
                    <div className="trends-container">
                        Trends
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
                                    />
                                </div>
                                {prev_update > 0 && props.update == 0 ? (
                                    <ButtonTrend
                                        title="Start chart updates"
                                        variant="outlined"
                                        onClick={play}
                                    >
                                        <PlayArrowOutlinedIcon fontSize="small" />
                                    </ButtonTrend>
                                ) : null}
                                {props.update > 0 ? (
                                    <ButtonTrend
                                        variant="outlined"
                                        title="Pause chart updates"
                                        onClick={() => pause(props)}
                                    >
                                        <PauseOutlinedIcon fontSize="small" />
                                    </ButtonTrend>
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
                                <p className="page-label">Points</p>
                                <div>
                                    <EditSelectNumber
                                        current_value={props.points}
                                        setParam={(n: number) => {
                                            setPropsDelayed({
                                                ...(props_sdata.current || props),
                                                points: n,
                                            });
                                        }}
                                        params={POINTS}
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
                                <ButtonTrend
                                    title="Download CSV"
                                    variant="outlined"
                                    disabled={oids.length === 0}
                                    onClick={() => {
                                        downloadTrendsCSV(items);
                                    }}
                                >
                                    <FileDownloadOutlinedIcon fontSize="small" />
                                </ButtonTrend>
                            </div>
                        </div>
                        <div style={{ display: oids.length === 0 ? "none" : "block" }}>
                            <LineChart
                                oid={oids}
                                timeframe={timeframe}
                                formula={formulas}
                                fill={`${props.points}A`}
                                digits={props.digits}
                                update={props.update || 86400}
                                args={args}
                                labels={labels}
                                colors={colors}
                                options={options}
                                className="chart-trends"
                                width={chartSize.current.x}
                                height={chartSize.current.y}
                                data_callback={(data) => {
                                    current_data = data;
                                }}
                            />
                        </div>
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
                        <ButtonTrend
                            variant="outlined"
                            sx={{ marginTop: "20px" }}
                            onClick={addChartItem}
                        >
                            <AddIcon />
                        </ButtonTrend>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTrends;
