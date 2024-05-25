import { useEvaAPICall, EvaErrorMessage } from "@eva-ics/webengine-react";
import { useState, useMemo } from "react";
import { Timestamp } from "bmat/time";
import { downloadCSV } from "bmat/dom";
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
import { formatAlarmValue, formatAlarmSourceKind } from "./AlarmState.tsx";
import {
    FilterParams,
    defaultHistoryFilterParams,
    defaultHistoryCols,
} from "../components/alarms.tsx";

const DEFAULT_FRAME_SEC = 3600;
const SVC_ID = "eva.aaa.accounting";

const DashboardAlarmHistory = () => {
    const [filterParams, setFilterParams] = useState<FilterParams>(defaultHistoryFilterParams());

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
                        Unable to call {SVC_ID} service. Read{" "}
                        <a
                            target="_blank"
                            href="https://info.bma.ai/en/actual/eva4/svc/eva-aaa-accounting.html"
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
