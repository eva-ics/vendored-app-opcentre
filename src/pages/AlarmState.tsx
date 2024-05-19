import { useState, useMemo } from "react";
import { downloadCSV } from "bmat/dom";
import {
    DashTable,
    ColumnRichInfo,
    DashTableData,
    DashTableColType,
    DashTableFilter,
    createRichFilter,
    DashTableColData,
    pushRichColData,
    generateDashTableRichCSV,
    DashTableFilterFieldInput,
} from "bmat/dashtable";
import { useQueryParams } from "bmat/hooks";
import { addButton, removeButton } from "../components/common.tsx";
import { useEvaAPICall, EvaErrorMessage, get_engine } from "@eva-ics/webengine-react";
import { ButtonStyled, DEFAULT_ALARM_SVC, onEvaError } from "../common.tsx";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import { Eva } from "@eva-ics/webengine";

const ALARM_OPS = ["TT", "TL", "LL", "SS", "SD", "OS", "CC", "AA", "US", "RD", "IS"];
const ALARM_CURRENT = ["TT", "TL", "LL", "SS", "SD", "OS", "CC", "AA"];

const ALARM_OP_NAMES = new Map();
ALARM_OP_NAMES.set("TT", "TRIGGERED");
ALARM_OP_NAMES.set("TL", "TRIG+LATCHED");
ALARM_OP_NAMES.set("LL", "LATCHED");
ALARM_OP_NAMES.set("SS", "SHELVED");
ALARM_OP_NAMES.set("SD", "SUSPENDED-BY-DESIGN");
ALARM_OP_NAMES.set("OS", "OUT-OF-SERVICE");
ALARM_OP_NAMES.set("CC", "CLEARED");
ALARM_OP_NAMES.set("AA", "ACKNOWLEDGED");
ALARM_OP_NAMES.set("US", "UNSHELVED");
ALARM_OP_NAMES.set("RD", "RESUMED-BY-DESIGN");
ALARM_OP_NAMES.set("IS", "IN-SERVICE");

const formatAlarmValue = (value: string, _current?: boolean) => {
    if (ALARM_OPS.includes(value)) {
        const name = ALARM_OP_NAMES.get(value);
        const class_name = `alarm-${value.toLowerCase()}`;
        return (
            <span className={class_name}>
                {name} ({value})
            </span>
        );
    } else {
        return value;
    }
};

const DashboardAlarmState = () => {
    const [filterParams, setFilterParams] = useState({
        node: null as string | null,
        level: null as number | null,
        group: null as string | null,
        id: null as string | null,
        active: true as boolean | null,
        current: null as string | null,
    });

    const [cols, setCols] = useState<ColumnRichInfo[]>([
        { id: "node", name: "node", enabled: true, filterInputSize: 6 },
        {
            id: "level",
            name: "level",
            enabled: true,
            filterInputSize: 2,
            columnType: DashTableColType.Integer,
        },
        { id: "group", name: "group", enabled: true, filterInputSize: 20 },
        { id: "id", name: "id", enabled: true, filterInputSize: 10 },
        {
            id: "current",
            name: "current",
            enabled: true,
            filterInputSize: 1,
            filterFieldInput: DashTableFilterFieldInput.SelectWithEmpty,
            filterFieldSelectValues: ALARM_CURRENT,
        },
    ]);

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
                setter: setFilterParams,
                pack_json: true,
            },
            {
                name: "cols",
                value: colsEnabled,
                setter: (ec: any) => {
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
        const f = { ...filterParams };
        return {
            filter: f,
        };
    }, [filterParams]);

    const setStateFilterParams = (p: object) => {
        let np: any = { ...filterParams };
        Object.keys(p).forEach((k) => {
            np[k] = (p as any)[k];
        });
        setFilterParams(np);
    };

    const active_label = (
        <div className="bmat-dashtable-filter-label-container">
            <span className="bmat-dashtable-filter-label-container">state</span>{" "}
        </div>
    );
    const active_select = (
        <select
            onChange={(e) => {
                let val: boolean | null = null;
                if (e.target.value === "active") {
                    val = true;
                } else if (e.target.value === "inactive") {
                    val = false;
                }
                setStateFilterParams({
                    active: val,
                });
            }}
            value={
                filterParams.active === true
                    ? "active"
                    : filterParams.active === false
                      ? "inactive"
                      : ""
            }
        >
            <option value=""></option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
        </select>
    );

    const filter: DashTableFilter = createRichFilter({
        cols,
        setCols,
        params: params.filter,
        setParams: setStateFilterParams,
        removeButton,
    }).concat([[active_label, active_select]]);

    const alarm_states: any = useEvaAPICall({
        method: loaded ? `x::${DEFAULT_ALARM_SVC}::state` : undefined,
        params,
        update: 1,
    });

    const alarmCall = (oid: string, method: string) => {
        const eva = get_engine() as Eva;
        const svc_method = `x::${DEFAULT_ALARM_SVC}::${method}`;
        eva.call(svc_method, oid).catch((e) => onEvaError(e));
    };

    const data: DashTableData = alarm_states?.data?.map((state: any) => {
        const colsData: DashTableColData[] = [];
        pushRichColData({
            colsData,
            id: "node",
            value: state.node,
            setParams: setStateFilterParams,
            cols,
            className: "col-fit",
            addButton,
        });
        pushRichColData({
            colsData,
            id: "level",
            value: state.level,
            setParams: setStateFilterParams,
            cols,
            className: "col-fit",
            addButton,
        });
        pushRichColData({
            colsData,
            id: "group",
            value: state.group,
            setParams: setStateFilterParams,
            cols,
            className: "col-fit",
            addButton,
        });
        pushRichColData({
            colsData,
            id: "id",
            value: state.id,
            setParams: setStateFilterParams,
            cols,
            className: "col-fit",
            addButton,
        });
        pushRichColData({
            colsData,
            id: "current",
            value: formatAlarmValue(state.current, true),
            filter_value: state.current,
            setParams: setStateFilterParams,
            cols,
            className: "col-fit",
            addButton,
        });
        let extra: DashTableColData[] = [
            {
                value: state.description,
            },
        ];
        if (state.current === "TL" || state.current === "LL" || state.current === "TT") {
            extra.push({
                value: (
                    <div className="print-hidden">
                        <button
                            title="Acknowledge"
                            className="btn-alarm-ack"
                            onClick={() => alarmCall(state.oid, "ack")}
                        >
                            Ack
                        </button>
                    </div>
                ),
                className: "col-fit",
            });
        } else {
            extra.push({
                value: "",
            });
        }
        if (state.current === "SS") {
            extra.push({
                value: (
                    <div className="print-hidden">
                        <button
                            title="Unshelve (resume)"
                            className="btn-alarm-unshelve"
                            onClick={() => alarmCall(state.oid, "unshelv")}
                        >
                            Unshelve
                        </button>
                    </div>
                ),
                className: "col-fit",
            });
        } else {
            extra.push({
                value: (
                    <div className="print-hidden">
                        <button
                            title="Shelve (suspend)"
                            className="btn-alarm-shelve"
                            onClick={() => alarmCall(state.oid, "shelv")}
                        >
                            Shelve
                        </button>
                    </div>
                ),
                className: "col-fit",
            });
        }
        return {
            data: colsData.concat(extra),
        };
    });

    const colsToShow = alarm_states.data
        ? cols
              .filter((column) => column.enabled)
              .map((column) => column.name)
              .concat(["description", "", ""])
        : [];

    let header = (
        <>
            <div>
                <EvaErrorMessage error={alarm_states.error} />
                {alarm_states?.error?.code === -32113 ? (
                    <div className="eva-error">
                        Unable to call ${DEFAULT_ALARM_SVC}. Read{" "}
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
                    disabled={alarm_states.data === null}
                    onClick={() => {
                        const csvContent = generateDashTableRichCSV({
                            data: alarm_states.data,
                            cols,
                        });
                        downloadCSV(csvContent, "alarms-states.csv");
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
                            id="alst"
                            header={header}
                            title="Alarms states"
                            cols={colsToShow}
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

export default DashboardAlarmState;
