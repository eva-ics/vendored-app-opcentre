import { ItemValue } from "@eva-ics/webengine-react";
import { fontWeight } from "idc-core";
import { useMemo, CSSProperties } from "react";
import { ValueMap } from "idc-core";

export const ItemValueWithLabel = ({
    label,
    formula,
    value_map,
    color,
    bgcolor,
    padding,
    value_padding,
    font_size,
    font_bold,
    units,
    digits,
    warnValue,
    critValue,
    lowWarnValue,
    lowCritValue,
    warn_bg,
    oid,
}: {
    label: string;
    formula: string;
    value_map?: Array<ValueMap>;
    color: string;
    bgcolor: string;
    padding: number;
    value_padding: number;
    font_size: number;
    font_bold: boolean;
    units: string;
    digits: number;
    oid: string;
    warnValue?: number;
    critValue?: number;
    lowWarnValue?: number;
    lowCritValue?: number;
    warn_bg: boolean;
}) => {
    const props = useMemo(() => {
        let props = { units: units, digits: digits, oid: oid, formula: formula };
        if (Array.isArray(value_map)) {
            (props as any).format_with = (value: any) => {
                const v = value.toString();
                for (const vm of value_map) {
                    if (vm.value == v) {
                        return vm.label;
                    }
                }
                return v;
            };
            (props as any).set_color_with = (value: any) => {
                const v = value.toString();
                for (const vm of value_map) {
                    if (vm.value == v) {
                        return vm.color;
                    }
                }
            };
        }
        (props as any).set_class_name_with = (value: any) => {
            const val = Number(value);
            if (lowCritValue !== undefined && val <= lowCritValue) {
                return "value-crit" + (warn_bg ? "-inv" : "");
            }
            if (lowWarnValue !== undefined && val <= lowWarnValue) {
                return "value-warn" + (warn_bg ? "-inv" : "");
            }
            if (critValue !== undefined && val >= critValue) {
                return "value-crit" + (warn_bg ? "-inv" : "");
            }
            if (warnValue !== undefined && val >= warnValue) {
                return "value-warn" + (warn_bg ? "-inv" : "");
            }
        };
        (props as any).set_style_with = (_value: any): CSSProperties => {
            return {
                padding: value_padding,
            };
        };
        return props;
    }, [
        units,
        digits,
        formula,
        oid,
        value_map,
        warnValue,
        critValue,
        lowWarnValue,
        lowCritValue,
        warn_bg,
        value_padding,
    ]);
    return (
        <div
            style={{
                color: color,
                backgroundColor: bgcolor,
                fontSize: font_size,
                padding: padding,
                fontWeight: fontWeight(font_bold),
            }}
        >
            {label}{" "}
            <span style={{ padding: value_padding }}>
                <ItemValue {...props} />
            </span>
        </div>
    );
};
