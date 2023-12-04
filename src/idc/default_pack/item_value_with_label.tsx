import { ItemValue } from "@eva-ics/webengine-react";
import { fontWeight } from "idc-core";
import { useMemo } from "react";
import { ValueMap } from "idc-core";

export const ItemValueWithLabel = ({
  label,
  value_map,
  color,
  font_size,
  font_bold,
  units,
  digits,
  warnValue,
  critValue,
  lowWarnValue,
  lowCritValue,
  oid
}: {
  label: string;
  value_map?: Array<ValueMap>;
  color: string;
  font_size: number;
  font_bold: boolean;
  units: string;
  digits: number;
  oid: string;
  warnValue?: number;
  critValue?: number;
  lowWarnValue?: number;
  lowCritValue?: number;
}) => {
  const props = useMemo(() => {
    let props = { units: units, digits: digits, oid: oid };
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
    return props;
  }, [
    units,
    digits,
    oid,
    value_map,
    warnValue,
    critValue,
    lowWarnValue,
    lowCritValue
  ]);
  return (
    <div
      style={{
        color: color,
        fontSize: font_size,
        fontWeight: fontWeight(font_bold)
      }}
    >
      {label} <ItemValue {...props} />
    </div>
  );
};
