import { Gauge } from "@eva-ics/webengine-react";
import { useMemo } from "react";

export const GaugeColorized = ({
    warnValue,
    critValue,
    lowWarnValue,
    lowCritValue,
    ...props
}: {
    warnValue?: number;
    critValue?: number;
    lowWarnValue?: number;
    lowCritValue?: number;
}) => {
    const c_props = useMemo(() => {
        let c_props = {
            warnValue: warnValue,
            critValue: critValue,
            lowWarnValue: lowWarnValue,
            lowCritValue: lowCritValue,
            ...props,
        };
        (c_props as any).set_class_name_with = (value: any) => {
            const val = parseFloat(value);
            if (lowCritValue !== undefined && val <= lowCritValue) {
                return "value-crit";
            }
            if (lowWarnValue !== undefined && val <= lowWarnValue) {
                return "value-warn";
            }
            if (critValue !== undefined && val >= critValue) {
                return "value-crit";
            }
            if (warnValue !== undefined && val >= warnValue) {
                return "value-warn";
            }
        };
        return c_props;
    }, [props, warnValue, critValue, lowWarnValue, lowCritValue]);
    return (
        <>
            <Gauge {...(c_props as any)} />
        </>
    );
};
