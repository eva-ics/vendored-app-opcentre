import { LineChart } from "@eva-ics/webengine-react";
import { rangeArray } from "bmat/numbers";
import { useMemo } from "react";

export const CHART_POINTS = rangeArray(5, 100, 5);

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
  "30D"
];

export const SizedLineChart = ({
  dragged,
  label,
  formula,
  width,
  min,
  max,
  color,
  points,
  digits,
  update,
  database,
  ...props
}: {
  dragged: boolean;
  label: string;
  formula: string,
  width: number;
  min: number;
  max: number;
  color: string;
  points: number;
  digits: number;
  update: number;
  database?: string;
}) => {
  const dig = useMemo(() => (digits === undefined ? 2 : digits), [digits]);
  const args = useMemo(() => {
    let args: any = {};
    if (database) {
      args.database = database;
    }
    return args;
  }, [database]);

  return (
    <div
      className="element-chart"
      style={{
        width: width,
        height: width / 2
      }}
    >
      <LineChart
        colors={[color]}
        labels={[label]}
        formula={[formula]}
        update={update}
        fill={`${points}A:${dig}`}
        args={args}
        options={{
          responsive: true,
          animations: false,
          scales: {
            y: {
              min: min,
              max: max
            }
          }
        }}
        {...(props as any)}
      />
    </div>
  );
};
