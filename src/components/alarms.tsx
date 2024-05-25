import {
    ColumnRichInfo,
    DashTableColType,
    DashTableFilterFieldInput,
    DashTableFilterActionKind
} from "bmat/dashtable";

export const ALARM_OPS = [
    "TT",
    "TL",
    "LL",
    "SS",
    "SD",
    "OS",
    "CC",
    "AA",
    "US",
    "RD",
    "IS",
];

export const ALARM_CURRENT = ["TT", "TL", "LL", "SS", "SD", "OS", "CC", "AA"];

export const ALARM_SOURCE_KINDS = ["U", "P", "R"];

export const ALARM_OP_NAMES = new Map();
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

export const ALARM_SOURCE_KIND_NAMES = new Map();
ALARM_SOURCE_KIND_NAMES.set("U", "User");
ALARM_SOURCE_KIND_NAMES.set("P", "Program");
ALARM_SOURCE_KIND_NAMES.set("R", "Rule");

export interface FilterParams {
    t_start: number | null;
    t_end: number | null;
    node: string | null;
    level: number | null;
    level_max: number | null;
    group: string | null;
    id: string | null;
    lo: string | null;
    losk: string | null;
    los: string | null;
}

export const defaultHistoryFilterParams = (): FilterParams => {
    return {
        t_start: null,
        t_end: null,
        node: null,
        level: null,
        level_max: null,
        group: null,
        id: null,
        lo: null,
        losk: null,
        los: null,
    };
};

export const defaultHistoryCols = (): ColumnRichInfo[] => {
    return [
        { id: "node", name: "node", enabled: true, filterInputSize: 6 },
        {
            id: "level",
            name: "level",
            enabled: true,
            filterInputSize: 2,
            columnType: DashTableColType.Integer,
            filterActionKind: DashTableFilterActionKind.GreaterEqual
        },
        {
            id: "level_max",
            name: "level.max",
            filterOnly: true,
            filterInputSize: 2,
            columnType: DashTableColType.Integer,
            filterActionKind: DashTableFilterActionKind.LessEqual,
        },
        { id: "group", name: "group", enabled: true, filterInputSize: 20 },
        { id: "id", name: "id", enabled: true, filterInputSize: 10 },
        {
            id: "lo",
            name: "last op",
            enabled: true,
            filterInputSize: 1,
            filterFieldInput: DashTableFilterFieldInput.SelectWithEmpty,
            filterFieldSelectValues: ALARM_OPS,
        },
        {
            id: "losk",
            name: "src.kind",
            enabled: true,
            filterInputSize: 1,
            filterFieldInput: DashTableFilterFieldInput.SelectWithEmpty,
            filterFieldSelectValues: ALARM_SOURCE_KINDS,
        },
        { id: "los", name: "src", enabled: true, filterInputSize: 10 },
    ];
};

const historyColsEnabled: string[] = defaultHistoryCols()
    .filter((c: ColumnRichInfo) => c.enabled)
    .map((c: ColumnRichInfo) => c.id);

export const historyColsEnabledPacked = encodeURIComponent(
    JSON.stringify(historyColsEnabled)
);
