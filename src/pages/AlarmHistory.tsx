import { useEvaAPICall, EvaErrorMessage } from "@eva-ics/webengine-react";
import { useState, useMemo } from "react";
import { Timestamp } from "bmat/time";
import { downloadCSV } from "bmat/dom";
import { Bar } from "react-chartjs-2";
import {
    DashTable,
    DashTableFilter,
    DashTableData,
    DashTableColData,
    ColumnRichInfo,
    pushRichColData,
    createRichFilter,
    generateDashTableRichCSV,
} from "bmat/dashtable";
import { useQueryParams } from "bmat/hooks";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import DateTimePickerSelect from "../components/date_time_picker.tsx";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { addButton, removeButton } from "../components/common.tsx";
import { ButtonStyled, DEFAULT_ALARM_SVC } from "../common.tsx";
import {
    formatAlarmValue,
    formatAlarmValueText,
    formatAlarmSourceKind,
} from "./AlarmState.tsx";
import { buildAlarmSeries } from "../components/AlarmDF.tsx";
import {
    FilterParams,
    defaultHistoryFilterParams,
    defaultHistoryCols,
} from "../components/alarms.tsx";

const DEFAULT_FRAME_SEC = 3600;

const ALARM_COLORS = [
    "#FF0000",
    "#FF6A00",
    "#FFD700",
    "#FF1493",
    "#FF00FF",
    "#E60000",
    "#E65F00",
    "#E6C300",
    "#E61283",
    "#E600E6",
    "#CC0000",
    "#CC5500",
    "#CCAF00",
    "#CC1074",
    "#CC00CC",
    "#B30000",
    "#B34A00",
    "#B39B00",
    "#B30E65",
    "#B300B3",
    "#990000",
    "#993F00",
    "#998700",
    "#990C56",
    "#990099",
    "#FF3333",
    "#FF8533",
    "#FFEB3B",
    "#FF5FA2",
    "#FF33FF",
    "#FF1A1A",
    "#FF751A",
    "#FFF176",
    "#FF77B3",
    "#FF4DFF",
    "#FF4D4D",
    "#FF944D",
    "#FFF59D",
    "#FF8FC4",
    "#FF66FF",
    "#FF6666",
    "#FFA366",
    "#FFF9C4",
    "#FFA7D5",
    "#FF80FF",
    "#FF8080",
    "#FFB380",
    "#FFFDE7",
    "#FFBFE6",
    "#FF99FF",
];

const getAlarmColor = (idx: number) => {
    return ALARM_COLORS[idx % ALARM_COLORS.length];
};

const calculateCt = (t_start: number, t_end: number) => {
    const t_range = t_end - t_start;
    let t_unit;
    if (t_range < 3600 * 2) {
        t_unit = "T";
    } else if (t_range < 86400 * 2) {
        t_unit = "H";
    } else if (t_range < 86400 * 30) {
        t_unit = "D";
    } else if (t_range < 86400 * 365) {
        t_unit = "W";
    } else {
        t_unit = "M";
    }
    let ct_unit;
    let ct_format;
    switch (t_unit) {
        case "T":
        case "S":
            ct_unit = "second";
            ct_format = "mm:ss";
            break;
        case "W":
            ct_unit = "day";
            ct_format = "MM/dd HH:mm";
            break;
        case "M":
            ct_unit = "month";
            ct_format = "yyyy/MM/dd";
            break;
        case "D":
            ct_unit = "hour";
            ct_format = "MM/dd HH:mm:ss";
            break;
        default:
            ct_unit = "minute";
            ct_format = "HH:mm:ss";
    }
    return { ct_unit, ct_format };
};

const DashboardAlarmHistory = () => {
    const [filterParams, setFilterParams] = useState<FilterParams>(
        defaultHistoryFilterParams()
    );

    const [cols, setCols] = useState<ColumnRichInfo[]>(defaultHistoryCols());

    const setFilterParamsSafe = (data: FilterParams) => {
        setFilterParams(Object.assign(defaultHistoryFilterParams(), data));
    };

    const colsEnabled = useMemo<string[]>(() => {
        return cols
            .filter((c: ColumnRichInfo) => c.enabled)
            .map((c: ColumnRichInfo) => c.id);
    }, [cols]);

    const loaded = useQueryParams(
        [
            {
                name: "filter",
                value: filterParams,
                setter: setFilterParamsSafe,
                pack_json: true,
            },
            {
                name: "cols",
                value: colsEnabled,
                setter: (ec) => {
                    const nc = [...cols];
                    nc.forEach((column) => {
                        column.enabled = ec.includes(column.id);
                    });
                    setCols(nc);
                },
                pack_json: true,
            },
        ],
        [filterParams, cols]
    );

    const params = useMemo(() => {
        const f: any = { ...filterParams };
        if (f.t_start === null) {
            f.t_start = new Timestamp().subSec(DEFAULT_FRAME_SEC).toNumber();
        }
        return {
            filter: f,
        };
    }, [filterParams]);

    const updateInterval = useMemo(() => {
        if (
            filterParams.t_end === null ||
            filterParams.t_end > new Timestamp().toNumber()
        ) {
            return 1;
        } else {
            return 5;
        }
    }, [filterParams]);

    const callParams = useMemo(() => {
        const f: any = { ...params.filter };
        f.level_min = f.level;
        delete f.level;
        return { filter: f };
    }, [params]);

    const records = useEvaAPICall(
        {
            method: loaded ? `x::${DEFAULT_ALARM_SVC}::history` : undefined,
            params: callParams,
            update: updateInterval,
        },
        [loaded, callParams, updateInterval]
    );

    const df = useMemo(() => {
        if (filterParams.t_start === null) {
            return {
                timestamps: [],
                series: new Map<string, (0 | 1)[]>(),
            };
        }
        return buildAlarmSeries(records.data || [], {
            fromTs: filterParams.t_start * 1000,
            toTs: filterParams.t_end ? filterParams.t_end * 1000 : Date.now(),
            maxPoints: 100,
        });
    }, [records.data, filterParams]);

    const { ct_unit, ct_format: _ } = useMemo(() => {
        return calculateCt(
            filterParams.t_start || 0,
            filterParams.t_end || Date.now() / 1000
        );
    }, [filterParams]);

    const chart_opts = useMemo(() => {
        return {
            responsive: true,
            animation: false,
            barPercentage: 1.5,

            maintainAspectRatio: false,
            scales: {
                y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    min: 0,
                    max: df.series.size,
                    ticks: {
                        stepSize: 1,
                        precision: 0,

                        callback: () => {
                            return "";
                        },
                    },
                },
                y1: {
                    type: "linear",
                    display: true,
                    position: "right",

                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    ticks: {
                        stepSize: 1,
                        precision: 0,

                        callback: () => {
                            return "";
                        },
                    },
                },
                x: {
                    type: "time",
                    time: {
                        unit: ct_unit,
                        unitStepSize: 1,
                        round: ct_unit,
                        tooltipFormat: "yyyy-MM-dd HH:mm:ss",
                    },

                    ticks: {
                        fontSize: 12,
                        fontColor: "#ccc",
                        maxTicksLimit: 8,
                        maxRotation: 0,
                        autoSkip: true,
                        callback: function (
                            value: any,
                            index: number,
                            values: Array<any>
                        ): any {
                            if (index === values.length - 1) {
                                return "";
                            } else {
                                return (this as any).getLabelForValue(value).split(" ");
                            }
                        },
                    },
                },
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (ctx: any) => {
                            const label = ctx[0].dataset.label;
                            const dataIndex = ctx[0].dataIndex;
                            const t_start = df.timestamps[dataIndex];
                            const t_end = df.timestamps[dataIndex + 1];
                            // find all records in this time range
                            const events = [];
                            for (const record of records.data || []) {
                                const t = record.t * 1000;
                                const a_label = record.group + "/" + record.id;
                                if (a_label !== label) {
                                    continue;
                                }
                                if (
                                    record.lo != "TT" &&
                                    record.lo != "TL" &&
                                    record.lo != "IS"
                                ) {
                                    continue;
                                }
                                if (t >= t_start && t < t_end) {
                                    const lo = formatAlarmValueText(record.lo, true);
                                    events.push(
                                        `${new Timestamp(record.t).toRFC3339(true)} ${lo}`
                                    );
                                }
                            }
                            return events.join("\n");
                        },
                        label: (ctx: any) => {
                            return ctx.dataset.label;
                        },
                    },
                },
                legend: {
                    display: true,
                },
                filler: {
                    propagate: true,
                },
            },
        };
    }, [df, records, ct_unit]);

    const chart_data = useMemo(() => {
        return {
            labels: df.timestamps.map((ts) => new Timestamp(ts / 1000).toRFC3339(true)),
            datasets: Array.from(df.series.entries()).map(([name, series], idx) => ({
                label: name,
                data: series.map((v) => (v ? [idx, idx + 1] : 0)),
                backgroundColor: getAlarmColor(idx),
                fill: false,
                stepped: true,
            })),
        };
    }, [df]);

    const setLogFilterParams = (p: object) => {
        let np: any = { ...filterParams };
        Object.keys(p).forEach((k) => {
            np[k] = (p as any)[k];
        });
        setFilterParams(np);
    };

    const t_start =
        filterParams.t_start === null
            ? new Timestamp().subSec(DEFAULT_FRAME_SEC)
            : new Timestamp(filterParams.t_start);
    const t_end =
        filterParams.t_end === null ? new Timestamp() : new Timestamp(filterParams.t_end);

    const timeFilter: DashTableFilter = [
        [
            "",
            <>
                <DateTimePickerSelect
                    enabled={filterParams.t_start !== null}
                    element_id="t_start"
                    update_key={filterParams.t_start === null ? records.data : null}
                    current_value={t_start.toDate()}
                    setParam={(d: Date) => {
                        setLogFilterParams({ t_start: new Timestamp(d).toNumber() });
                    }}
                />
            </>,
        ],
        [
            "",
            <>
                <div
                    title="toggle real-time view"
                    className={
                        "bmat-dashtable-filter-label bmat-dashtable-filter-label-button " +
                        (params.filter.t_end ? "" : "filter-label-disabled")
                    }
                    style={{ cursor: "pointer" }}
                    onClick={(e) => {
                        e.preventDefault();
                        if (params.filter.t_end === null) {
                            setLogFilterParams({
                                t_start: t_start.toNumber(),
                                t_end: t_end.toNumber(),
                            });
                        } else {
                            setLogFilterParams({
                                t_start: null,
                                t_end: null,
                            });
                        }
                    }}
                >
                    <DoubleArrowIcon fontSize="inherit" />
                </div>
                <DateTimePickerSelect
                    enabled={params.filter.t_end !== null}
                    element_id="t_end"
                    update_key={filterParams.t_start === null ? records.data : null}
                    current_value={t_end.toDate()}
                    setParam={(d: Date) => {
                        setLogFilterParams({ t_end: new Timestamp(d).toNumber() });
                    }}
                />
            </>,
        ],
    ];

    const filter: DashTableFilter = timeFilter.concat(
        createRichFilter({
            cols,
            setCols,
            params: params.filter,
            setParams: setLogFilterParams,
            removeButton,
        })
    );

    const data: DashTableData = records?.data?.toReversed().map((record: any) => {
        const t = new Timestamp(record.t);
        const colsData: DashTableColData[] = [
            {
                value: t.toRFC3339(true),
                sort_value: t.toNumber(),
                className: "col-fit never-wrap",
            },
        ];
        pushRichColData({
            colsData,
            id: "node",
            value: record.node,
            setParams: setLogFilterParams,
            cols,
            addButton,
        });
        pushRichColData({
            colsData,
            id: "level",
            className: "col-fit",
            value: record.level,
            setParams: setLogFilterParams,
            cols,
            addButton,
        });
        pushRichColData({
            colsData,
            id: "group",
            value: record.group,
            setParams: setLogFilterParams,
            cols,
            addButton,
        });
        pushRichColData({
            colsData,
            id: "id",
            value: record.id,
            setParams: setLogFilterParams,
            cols,
            addButton,
        });
        pushRichColData({
            colsData,
            id: "lo",
            value: formatAlarmValue(record.lo, true),
            className: "col-fit never-wrap",
            filter_value: record.lo,
            setParams: setLogFilterParams,
            cols,
            addButton,
        });
        pushRichColData({
            colsData,
            id: "losk",
            className: "col-fit never-wrap",
            value: formatAlarmSourceKind(record.losk),
            filter_value: record.losk,
            setParams: setLogFilterParams,
            cols,
            addButton,
        });
        pushRichColData({
            colsData,
            id: "los",
            value: record.los,
            setParams: setLogFilterParams,
            cols,
            addButton,
        });
        return {
            data: colsData,
        };
    });

    const colsToShow = records.data
        ? ["time"].concat(
              cols.filter((column) => column.enabled).map((column) => column.name)
          )
        : [];

    let header = (
        <>
            <div className="print-info-bar">
                {t_start.toRFC3339()} - {t_end.toRFC3339()}
            </div>
            <div>
                <EvaErrorMessage error={records.error} />
                {records?.error?.code === -32113 ? (
                    <div className="eva-error">
                        Unable to call {DEFAULT_ALARM_SVC} service. Read{" "}
                        <a
                            target="_blank"
                            href="https://info.bma.ai/en/actual/eva4/svc/eva-svc-alarms.html"
                        >
                            how to deploy a service instance
                        </a>
                    </div>
                ) : (
                    ""
                )}{" "}
            </div>
            <div className="button-bar">
                <ButtonStyled
                    variant="outlined"
                    title="Download CSV"
                    disabled={records.data === null}
                    onClick={() => {
                        const csvContent = generateDashTableRichCSV({
                            data: records.data,
                            cols,
                            timeCol: "t",
                        });
                        downloadCSV(csvContent, "alarm-history.csv");
                    }}
                >
                    <FileDownloadOutlinedIcon fontSize="small" />
                </ButtonStyled>
                <ButtonStyled
                    title="Print"
                    variant="outlined"
                    onClick={() => {
                        window.print();
                    }}
                >
                    <PrintOutlinedIcon fontSize="small" />
                </ButtonStyled>
            </div>
            {df.series.size ? (
                <div
                    style={{ height: 60 + 35 * df.series.size }}
                    className="eva chart container"
                >
                    <Bar data={chart_data} options={chart_opts as any} />
                </div>
            ) : null}
        </>
    );
    return (
        <div>
            <div className="dashboard-main-wrapper dashboard-main-wrapper-big">
                <div className="dashboard-main-wrapper-content">
                    <div className="dashboard-main-wrapper-content__side-left">
                        <DashTable
                            id="accev"
                            header={header}
                            title="Alarm history"
                            cols={colsToShow}
                            filter={filter}
                            data={data}
                            className="content-longtable"
                            rememberQs={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAlarmHistory;
