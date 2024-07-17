import { Chart, ChartKind } from "@eva-ics/webengine-react";
import { rangeArray } from "bmat/numbers";
import { useMemo } from "react";

export const SIZED_LINE_CHART_WIDTH = rangeArray(250, 700, 50);

export const CHART_TIME_FRAMES = [
    "1T",
    "5T",
    "15T",
    "30T",
    "1H",
    "2H",
    "4H",
    "8H",
    "16H",
    "1D",
    "2D",
    "7D",
    "30D",
];

export const CHART_KINDS = [ChartKind.Line, ChartKind.Bar];

export const VALUE_FN = ["mean", "sum"];

export const SizedLineChart = ({
    dragged,
    label,
    type,
    vfn,
    formula,
    width,
    min,
    max,
    color,
    points, // deprecated
    fill,
    fill_units,
    digits,
    update,
    database,
    ...props
}: {
    dragged: boolean;
    label: string;
    type: ChartKind;
    vfn: string;
    formula: string;
    width: number;
    min: number;
    max: number;
    color: string;
    points?: number;
    fill?: number;
    fill_units?: string;
    digits: number;
    update: number;
    database?: string;
}) => {
    const fill_n = fill || points || 30;
    const dig = useMemo(() => (digits === undefined ? 2 : digits), [digits]);
    const args = useMemo(() => {
        let args: any = {
            xopts: {
                vfn: vfn || "mean",
            },
        };
        if (database) {
            args.database = database;
        }
        return args;
    }, [database, vfn]);

    return (
        <div
            className="element-chart"
            style={{
                width: width,
                height: width / 2,
            }}
        >
            <Chart
                kind={type || ChartKind.Line}
                colors={[color]}
                labels={[label]}
                formula={[formula]}
                update={update}
                fill={`${fill_n}${fill_units || "A"}:${dig}`}
                args={args}
                options={{
                    responsive: true,
                    animations: false,
                    scales: {
                        y: {
                            min: min,
                            max: max,
                        },
                    },
                }}
                {...(props as any)}
            />
        </div>
    );
};
