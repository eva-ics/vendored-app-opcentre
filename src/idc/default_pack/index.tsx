import { Label } from "./label";
import { Button } from "./button";
import { SizedImage } from "./sized_image";
import { SizedIFrame } from "./sized_iframe";
import { ItemValueWithLabel } from "./item_value_with_label";
import { SizedCanvas } from "./sized_canvas";
import { SizedLineChart } from "./sized_line_chart";
import { Frame } from "./frame";
import { GaugeColorized } from "./gauge_colorized";
import { AlarmBell } from "./alarm_bell";
import { DashboardVariable } from "./dashboard_variable";
import {
    ControlButtonToggleStyled,
    ControlButtonToggleStyle,
} from "./control_button_toggle_styled";
import { Pipe, PipeEnding, PipeStyle } from "./pipe";
import { ControlButtonValue, ControlButtonRun } from "@eva-ics/webengine-react";
import { PropertyKind } from "idc-core";
import { GaugeType } from "@eva-ics/webengine-react";
import { CHART_TIME_FRAMES, CHART_KINDS, VALUE_FN } from "./sized_line_chart";
import { ElementClass, ElementPack } from "idc-core";
import { v4 as uuidv4 } from "uuid";
import { TextFormatOutlined, CheckBoxOutlineBlankOutlined } from "@mui/icons-material";
import { DispatchWithoutAction } from "react";

import LooksOneOutlinedIcon from "@mui/icons-material/LooksOneOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import WebAssetOutlinedIcon from "@mui/icons-material/WebAssetOutlined";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import GradingIcon from "@mui/icons-material/Grading";

export enum ElementKind {
    Label = "label",
    ItemValue = "item_value",
    Gauge = "gauge",
    LineChart = "line_chart",
    Canvas = "canvas",
    Image = "image",
    Frame = "frame",
    Pipe = "pipe",
    IFrame = "iframe",
    Button = "button",
    ControlButtonToggle = "control_button_toggle",
    ControlButtonValue = "control_button_value",
    ControlButtonRun = "control_button_run",
    AlarmBell = "alarm_bell",
    DashboardVariable = "dashboard_variable",
}

enum ElementGroup {
    UI = "UI elements",
    Value = "Item values",
    Chart = "Charts",
    Action = "Item actions",
    Notifications = "Notifications",
}

const FILL_UNITS = ["A", "S", "T", "H", "D", "W"];

const LabelIcon = () => {
    return <TextFormatOutlined style={{ fontSize: 25 }} />;
};

const PipeIcon = () => {
    return <HorizontalRuleIcon style={{ fontSize: 25 }} />;
};

const FrameIcon = () => {
    return <CheckBoxOutlineBlankOutlined style={{ fontSize: 25 }} />;
};

const EnterValueIcon = () => {
    return <LooksOneOutlinedIcon style={{ fontSize: 25 }} />;
};

const RunIcon = () => {
    return <PlayArrowIcon style={{ fontSize: 25 }} />;
};

const AlarmBellIcon = () => {
    return <NotificationsActiveIcon style={{ fontSize: 25 }} />;
};

const IFrameIcon = () => {
    return <WebAssetOutlinedIcon style={{ fontSize: 25 }} />;
};

const ButtonIcon = () => {
    return <TouchAppOutlinedIcon style={{ fontSize: 25 }} />;
};

const DashboardVariableIcon = () => {
    return <GradingIcon style={{ fontSize: 25 }} />;
};

export const ELEMENT_CLASSES: Map<ElementKind, ElementClass> = new Map();
ELEMENT_CLASSES.set(ElementKind.Label, {
    description: "Text label",
    group: ElementGroup.UI,
    IconDraw: LabelIcon,
    defaults: {
        text: "Label",
        font_size: 14,
        font_bold: false,
    },
    props: [
        {
            id: uuidv4(),
            name: "text",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
        { id: uuidv4(), name: "color", kind: PropertyKind.SelectColor },
        {
            id: uuidv4(),
            name: "font_size",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 8, max: 50 },
        },
        { id: uuidv4(), name: "font_bold", kind: PropertyKind.Boolean },
    ],
    default_size: { x: 20, y: 20 },
    boxed: true,
    actions: false,
});
ELEMENT_CLASSES.set(ElementKind.DashboardVariable, {
    description: "Dashboard variable",
    group: ElementGroup.UI,
    IconDraw: DashboardVariableIcon,
    defaults: {
        width: 100,
        variable: "",
        default_value: "",
        values: [] as string[],
        style: "list",
    },
    props: [
        {
            id: uuidv4(),
            name: "variable",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "default_value",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "width",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 20, max: 300, step: 10 },
        },
        {
            id: uuidv4(),
            name: "values",
            kind: PropertyKind.StringList,
        },
        {
            id: uuidv4(),
            name: "style",
            kind: PropertyKind.SelectString,
            params: ["list", "input"],
        },
    ],
    default_size: { x: 20, y: 20 },
    boxed: true,
    actions: true,
});
ELEMENT_CLASSES.set(ElementKind.Image, {
    description: "Image",
    group: ElementGroup.UI,
    default_zIndex: 5,
    defaults: {
        image: undefined,
        width: 300,
        height_p: 100,
        rotate: 0,
        hflip: false,
        vflip: false,
        blur: 0,
        brightness: 100,
        contrast: 100,
        hue_rotate: 0,
        invert: 0,
        opacity: 100,
        saturate: 100,
        sepia: 0,
        update: 0,
    },
    props: [
        {
            id: uuidv4(),
            name: "image",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "width",
            kind: PropertyKind.Number,
            params: { size: 5, min: 20 },
        },
        {
            id: uuidv4(),
            name: "height_p",
            kind: PropertyKind.Number,
            params: { size: 5, min: 1 },
        },
        {
            id: uuidv4(),
            name: "rotate",
            kind: PropertyKind.SelectNumberSlider,
            params: { size: 5, min: 0, max: 360 - 10, step: 10 },
        },
        { id: uuidv4(), name: "hflip", kind: PropertyKind.Boolean },
        { id: uuidv4(), name: "vflip", kind: PropertyKind.Boolean },
        {
            id: uuidv4(),
            name: "blur",
            kind: PropertyKind.Number,
            params: { size: 5, min: 0, max: 100 },
        },
        {
            id: uuidv4(),
            name: "brightness",
            kind: PropertyKind.Number,
            params: { size: 5, min: 0, max: 500 },
        },
        {
            id: uuidv4(),
            name: "contrast",
            kind: PropertyKind.Number,
            params: { size: 5, min: 0, max: 500 },
        },
        {
            id: uuidv4(),
            name: "hue_rotate",
            kind: PropertyKind.SelectNumberSlider,
            params: { size: 5, min: 0, max: 359 },
        },
        {
            id: uuidv4(),
            name: "invert",
            kind: PropertyKind.SelectNumberSlider,
            params: { size: 5, min: 0, max: 100 },
        },
        {
            id: uuidv4(),
            name: "opacity",
            kind: PropertyKind.SelectNumberSlider,
            params: { size: 5, min: 0, max: 100 },
        },
        {
            id: uuidv4(),
            name: "saturate",
            kind: PropertyKind.Number,
            params: { size: 5, min: 0 },
        },
        {
            id: uuidv4(),
            name: "sepia",
            kind: PropertyKind.SelectNumberSlider,
            params: { size: 5, min: 0, max: 100 },
        },
        {
            id: uuidv4(),
            name: "update",
            kind: PropertyKind.Number,
            params: { size: 2, min: 0 },
        },
    ],
    default_size: { x: 20, y: 20 },
    boxed: true,
    actions: false,
});
ELEMENT_CLASSES.set(ElementKind.IFrame, {
    description: "IFrame",
    group: ElementGroup.UI,
    default_zIndex: 4,
    IconDraw: IFrameIcon,
    defaults: {
        image: undefined,
        width: 300,
        height: 300,
        update: 0,
    },
    props: [
        {
            id: uuidv4(),
            name: "url",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "width",
            kind: PropertyKind.Number,
            params: { size: 5, min: 20 },
        },
        {
            id: uuidv4(),
            name: "height",
            kind: PropertyKind.Number,
            params: { size: 5, min: 20 },
        },
        {
            id: uuidv4(),
            name: "update",
            kind: PropertyKind.Number,
            params: { size: 2, min: 0 },
        },
    ],
    default_size: { x: 300, y: 300 },
    boxed: true,
    actions: true,
});
ELEMENT_CLASSES.set(ElementKind.Button, {
    description: "Button",
    group: ElementGroup.UI,
    IconDraw: ButtonIcon,
    defaults: {
        text: "Click me",
        action: "https://www.bohemia-automation.com/",
    },
    props: [
        {
            id: uuidv4(),
            name: "text",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "action",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
    ],
    default_size: { x: 50, y: 20 },
    boxed: true,
    actions: true,
});
ELEMENT_CLASSES.set(ElementKind.ItemValue, {
    description: "Item value",
    group: ElementGroup.Value,
    defaults: {
        label: "Value",
        font_size: 14,
        font_bold: false,
        units: "",
        digits: 2,
        color: "",
        bgcolor: "",
        padding: 0,
        value_padding: 0,
        oid: undefined,
        formula: "x",
        value_map: undefined,
        warnValue: undefined,
        critValue: undefined,
        lowWarnValue: undefined,
        lowCritValue: undefined,
        warn_bg: false,
    },
    props: [
        {
            id: uuidv4(),
            name: "oid",
            kind: PropertyKind.OIDSubscribed,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "label",
            kind: PropertyKind.String,
            params: { size: 20 },
        },
        { id: uuidv4(), name: "color", kind: PropertyKind.SelectColor },
        { id: uuidv4(), name: "bgcolor", kind: PropertyKind.SelectColor },
        {
            id: uuidv4(),
            name: "padding",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 0, max: 10 },
        },
        {
            id: uuidv4(),
            name: "value_padding",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 0, max: 10 },
        },
        {
            id: uuidv4(),
            name: "font_size",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 8, max: 50 },
        },
        { id: uuidv4(), name: "font_bold", kind: PropertyKind.Boolean },
        {
            id: uuidv4(),
            name: "units",
            kind: PropertyKind.String,
            params: { size: 5 },
        },
        {
            id: uuidv4(),
            name: "formula",
            kind: PropertyKind.Formula,
            params: { size: 20 },
        },
        {
            id: uuidv4(),
            name: "digits",
            kind: PropertyKind.Number,
            params: { size: 5, min: 0, allow_undefined: true },
        },
        {
            id: uuidv4(),
            name: "value_map",
            kind: PropertyKind.ValueMap,
            params: {
                size: 40,
                title: "Value mapping",
                help: "Enter labels matching item value",
            },
        },
        {
            id: uuidv4(),
            name: "warnValue",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        {
            id: uuidv4(),
            name: "critValue",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        {
            id: uuidv4(),
            name: "lowWarnValue",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        {
            id: uuidv4(),
            name: "lowCritValue",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        { id: uuidv4(), name: "warn_bg", kind: PropertyKind.Boolean },
    ],
    default_size: { x: 20, y: 20 },
    boxed: true,
    actions: false,
});
ELEMENT_CLASSES.set(ElementKind.Gauge, {
    description: "Gauge",
    group: ElementGroup.Chart,
    defaults: {
        type: GaugeType.Light,
        minValue: 0,
        maxValue: 100,
        warnValue: 60,
        critValue: 70,
        lowWarnValue: 10,
        lowCritValue: 5,
        diameter: 250,
        numTicks: 9,
        units: "",
        showValue: true,
        digits: 2,
        oid: undefined,
        formula: "x",
    },
    props: [
        {
            id: uuidv4(),
            name: "oid",
            kind: PropertyKind.OIDSubscribed,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "type",
            kind: PropertyKind.SelectString,
            params: [
                GaugeType.Light,
                GaugeType.Modern,
                GaugeType.Minimal,
                GaugeType.Sphere,
                GaugeType.Standart,
            ],
        },
        {
            id: uuidv4(),
            name: "units",
            kind: PropertyKind.String,
            params: { size: 5 },
        },
        { id: uuidv4(), name: "showValue", kind: PropertyKind.Boolean },
        {
            id: uuidv4(),
            name: "label",
            kind: PropertyKind.String,
            params: { size: 20 },
        },
        {
            id: uuidv4(),
            name: "diameter",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 150, max: 400, step: 10 },
        },
        {
            id: uuidv4(),
            name: "numTicks",
            kind: PropertyKind.Number,
            params: { size: 5, min: 2 },
        },
        {
            id: uuidv4(),
            name: "formula",
            kind: PropertyKind.Formula,
            params: { size: 20 },
        },
        {
            id: uuidv4(),
            name: "digits",
            kind: PropertyKind.Number,
            params: { size: 5, min: 0, allow_undefined: true },
        },
        {
            id: uuidv4(),
            name: "minValue",
            kind: PropertyKind.Number,
            params: { size: 5, float: true },
        },
        {
            id: uuidv4(),
            name: "maxValue",
            kind: PropertyKind.Number,
            params: { size: 5, float: true },
        },
        {
            id: uuidv4(),
            name: "warnValue",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        {
            id: uuidv4(),
            name: "critValue",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        {
            id: uuidv4(),
            name: "lowWarnValue",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        {
            id: uuidv4(),
            name: "lowCritValue",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
    ],
    default_size: { x: 100, y: 100 },
    boxed: true,
    actions: false,
});
ELEMENT_CLASSES.set(ElementKind.LineChart, {
    description: "Line chart",
    group: ElementGroup.Chart,
    defaults: {
        oid: undefined,
        title: undefined,
        label: undefined,
        formula: "x",
        width: 400,
        color: "lightblue",
        timeframe: "1H",
        fill: 30,
        fill_units: FILL_UNITS[0],
        min: undefined,
        max: undefined,
        digits: 2,
        update: 10,
        type: CHART_KINDS[0],
        vfn: VALUE_FN[0],
        database: undefined,
    },
    props: [
        {
            id: uuidv4(),
            name: "oid",
            kind: PropertyKind.OID,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "title",
            kind: PropertyKind.String,
            params: { size: 20 },
        },
        {
            id: uuidv4(),
            name: "label",
            kind: PropertyKind.String,
            params: { size: 20 },
        },
        {
            id: uuidv4(),
            name: "width",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 250, max: 700, step: 50 },
        },
        {
            id: uuidv4(),
            name: "type",
            kind: PropertyKind.SelectString,
            params: CHART_KINDS,
        },
        { id: uuidv4(), name: "color", kind: PropertyKind.SelectColor },
        {
            id: uuidv4(),
            name: "vfn",
            kind: PropertyKind.SelectString,
            params: VALUE_FN,
        },
        {
            id: uuidv4(),
            name: "formula",
            kind: PropertyKind.Formula,
            params: { size: 20 },
        },
        {
            id: uuidv4(),
            name: "min",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        {
            id: uuidv4(),
            name: "max",
            kind: PropertyKind.Number,
            params: { size: 5, allow_undefined: true, float: true },
        },
        {
            id: uuidv4(),
            name: "digits",
            kind: PropertyKind.Number,
            params: { size: 5, min: 0, allow_undefined: true },
        },
        {
            id: uuidv4(),
            name: "update",
            kind: PropertyKind.Number,
            params: { size: 5, min: 1 },
        },
        {
            id: uuidv4(),
            name: "database",
            kind: PropertyKind.SelectDatabase,
            params: { size: 5 },
        },
        {
            id: uuidv4(),
            name: "timeframe",
            kind: PropertyKind.SelectString,
            params: CHART_TIME_FRAMES,
        },
        {
            id: uuidv4(),
            name: "fill",
            kind: PropertyKind.Number,
            params: { min: 1, max: 1000 },
        },
        {
            id: uuidv4(),
            name: "fill_units",
            kind: PropertyKind.SelectString,
            params: FILL_UNITS,
        },
    ],
    default_size: { x: 250, y: 125 },
    boxed: false,
    actions: false,
});
ELEMENT_CLASSES.set(ElementKind.Canvas, {
    description: "Canvas",
    group: ElementGroup.UI,
    default_zIndex: 1,
    defaults: {
        image: undefined,
        width: 300,
        height: 300,
    },
    props: [
        {
            id: uuidv4(),
            name: "image",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "width",
            kind: PropertyKind.Number,
            params: { size: 5, min: 20 },
        },
        {
            id: uuidv4(),
            name: "height",
            kind: PropertyKind.Number,
            params: { size: 5, min: 20 },
        },
    ],
    default_size: { x: 20, y: 20 },
    boxed: false,
    actions: false,
});
ELEMENT_CLASSES.set(ElementKind.Frame, {
    description: "Frame",
    IconDraw: FrameIcon,
    group: ElementGroup.UI,
    default_zIndex: 3,
    defaults: {
        label: "",
        width: 300,
        height: 300,
    },
    props: [
        {
            id: uuidv4(),
            name: "title",
            kind: PropertyKind.String,
            params: { size: 40 },
        },
        {
            id: uuidv4(),
            name: "width",
            kind: PropertyKind.Number,
            params: { size: 5, min: 20 },
        },
        {
            id: uuidv4(),
            name: "height",
            kind: PropertyKind.Number,
            params: { size: 5, min: 20 },
        },
    ],
    default_size: { x: 20, y: 20 },
    boxed: false,
    actions: false,
});
ELEMENT_CLASSES.set(ElementKind.Pipe, {
    description: "Pipe",
    IconDraw: PipeIcon,
    group: ElementGroup.UI,
    default_zIndex: 4,
    defaults: {
        diameter: 10,
        length: 200,
        vertical: false,
        start: PipeEnding.Open,
        end: PipeEnding.Open,
        style: PipeStyle.Rings,
        shadow: 50,
        color: "#eee",
        oid: undefined,
        value_color: undefined,
    },
    props: [
        {
            id: uuidv4(),
            name: "diameter",
            kind: PropertyKind.Number,
            params: { size: 5, min: 5 },
        },
        {
            id: uuidv4(),
            name: "length",
            kind: PropertyKind.Number,
            params: { size: 5, min: 5 },
        },
        { id: uuidv4(), name: "vertical", kind: PropertyKind.Boolean },
        {
            id: uuidv4(),
            name: "start",
            kind: PropertyKind.SelectString,
            params: [PipeEnding.Open, PipeEnding.Closed],
        },
        {
            id: uuidv4(),
            name: "end",
            kind: PropertyKind.SelectString,
            params: [PipeEnding.Open, PipeEnding.Closed],
        },
        {
            id: uuidv4(),
            name: "style",
            kind: PropertyKind.SelectString,
            params: [PipeStyle.Rings, PipeStyle.Segmented, PipeStyle.Solid],
        },
        {
            id: uuidv4(),
            name: "shadow",
            kind: PropertyKind.Number,
            params: { size: 5, min: 0, max: 100 },
        },
        { id: uuidv4(), name: "color", kind: PropertyKind.SelectColor },
        { id: uuidv4(), name: "oid", kind: PropertyKind.OIDSubscribed },
        {
            id: uuidv4(),
            name: "value_color",
            kind: PropertyKind.ValueColorMap,
            params: {
                size: 40,
                title: "Value mapping",
                help: "Select colors matching item value",
            },
        },
    ],
    default_size: { x: 20, y: 20 },
    boxed: false,
    actions: false,
});
ELEMENT_CLASSES.set(ElementKind.ControlButtonToggle, {
    description: "CBtn.Toggle",
    group: ElementGroup.Action,
    defaults: {
        oid: undefined,
        label: "Button",
        style: ControlButtonToggleStyle.Button,
    },
    props: [
        {
            id: uuidv4(),
            name: "oid",
            kind: PropertyKind.OIDSubscribed,
            params: { kind: "unit" },
        },
        {
            id: uuidv4(),
            name: "label",
            kind: PropertyKind.String,
            params: { size: 30 },
        },
        {
            id: uuidv4(),
            name: "style",
            kind: PropertyKind.SelectString,
            params: [
                ControlButtonToggleStyle.Button,
                ControlButtonToggleStyle.Relay,
                ControlButtonToggleStyle.Valve,
            ],
        },
    ],
    default_size: { x: 50, y: 50 },
    boxed: true,
    actions: true,
});
ELEMENT_CLASSES.set(ElementKind.ControlButtonValue, {
    description: "CBtn.Value",
    group: ElementGroup.Action,
    IconDraw: EnterValueIcon,
    defaults: {
        oid: undefined,
        input_size: 5,
        label: "Unit value",
    },
    props: [
        {
            id: uuidv4(),
            name: "oid",
            kind: PropertyKind.OIDSubscribed,
            params: { kind: "unit" },
        },
        {
            id: uuidv4(),
            name: "label",
            kind: PropertyKind.String,
            params: { size: 30 },
        },
        {
            id: uuidv4(),
            name: "input_size",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 1, max: 30 },
        },
    ],
    default_size: { x: 50, y: 50 },
    boxed: true,
    actions: true,
});
ELEMENT_CLASSES.set(ElementKind.ControlButtonRun, {
    description: "CBtn.Run",
    group: ElementGroup.Action,
    IconDraw: RunIcon,
    defaults: {
        oid: undefined,
        label: "Run",
    },
    props: [
        {
            id: uuidv4(),
            name: "oid",
            kind: PropertyKind.SelectServerOID,
            params: { i: "lmacro:#" },
        },
        {
            id: uuidv4(),
            name: "label",
            kind: PropertyKind.String,
            params: { size: 30 },
        },
    ],
    default_size: { x: 50, y: 50 },
    boxed: true,
    actions: true,
});
ELEMENT_CLASSES.set(ElementKind.AlarmBell, {
    description: "Alarm bell",
    group: ElementGroup.Notifications,
    IconDraw: AlarmBellIcon,
    defaults: {
        size: 25,
        sound: true,
    },
    props: [
        {
            id: uuidv4(),
            name: "size",
            kind: PropertyKind.SelectNumberSlider,
            params: { min: 20, max: 100 },
        },
        { id: uuidv4(), name: "sound", kind: PropertyKind.Boolean },
    ],
    default_size: { x: 50, y: 50 },
    boxed: true,
    actions: true,
});

const Viewer = ({
    kind,
    dragged,
    vendored,
    setVariable,
    getVariable,
    forceUpdate,
    ...params
}: {
    kind: string;
    dragged: boolean;
    vendored?: any;
    setVariable: (name: string, value: any) => void;
    getVariable: (name: string) => string | undefined;
    forceUpdate: DispatchWithoutAction;
}): JSX.Element => {
    switch (kind as ElementKind) {
        case ElementKind.Label:
            return <Label {...(params as any)} />;
        case ElementKind.ItemValue:
            return <ItemValueWithLabel {...(params as any)} />;
        case ElementKind.Gauge:
            return <GaugeColorized {...(params as any)} />;
        case ElementKind.LineChart:
            return <SizedLineChart dragged={dragged} {...(params as any)} />;
        case ElementKind.Canvas:
            return <SizedCanvas {...(params as any)} />;
        case ElementKind.Frame:
            return <Frame {...(params as any)} />;
        case ElementKind.Image:
            return <SizedImage {...(params as any)} />;
        case ElementKind.IFrame:
            return <SizedIFrame {...(params as any)} />;
        case ElementKind.Button:
            return <Button {...(params as any)} />;
        case ElementKind.Pipe:
            return <Pipe {...(params as any)} />;
        case ElementKind.ControlButtonToggle:
            return <ControlButtonToggleStyled {...(params as any)} />;
        case ElementKind.ControlButtonValue:
            return <ControlButtonValue {...(params as any)} />;
        case ElementKind.ControlButtonRun:
            return <ControlButtonRun {...(params as any)} />;
        case ElementKind.AlarmBell:
            return <AlarmBell {...(params as any)} />;
        case ElementKind.DashboardVariable:
            return (
                <DashboardVariable
                    setVariable={setVariable}
                    getVariable={getVariable}
                    {...(params as any)}
                />
            );
        default:
            if (kind.startsWith("clipart/")) {
                const c_params = { ...params, image: vendored?.image };
                return <SizedImage {...(c_params as any)} />;
            } else {
                return <div className="idc-element-unsupported">Unsupported element</div>;
            }
    }
};

export const element_pack: ElementPack = {
    classes: ELEMENT_CLASSES,
    Viewer: Viewer,
};
