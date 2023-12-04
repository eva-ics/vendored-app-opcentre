import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material/Select";
import { EditNumber } from "./number.tsx";
import { SelectLastPeriod, PeriodValue } from "./select_last_period.tsx";
import DateTimePickerSelect from "./date_time_picker.tsx";

enum PeriodKind {
  Last = "last",
  Range = "range"
}

export const SelectPeriod = ({
  element_id,
  update_key,
  current_value,
  setParam
}: {
  current_value: string;
  setParam: (a: string) => void;
  element_id: string;
  update_key?: any;
}) => {
  const [selectedPeriodKind, setSelectedPeriodKind] = useState<PeriodKind>(
    current_value.includes(":") ? PeriodKind.Range : PeriodKind.Last
  );

  const [number, setNumber] = useState(
    current_value.includes(":") ? 1 : parseInt(current_value.slice(0, -1))
  );

  const [lastPeriod, setLastPeriod] = useState<PeriodValue>(
    current_value.includes(":")
      ? PeriodValue.Day
      : (current_value.slice(-1) as PeriodValue)
  );

  const [dateFrom, setDateFrom] = useState<Date>(
    current_value.includes(":")
      ? new Date(parseFloat(current_value.split(":")[0]) * 1000)
      : new Date(new Date().getTime() - 86_400_000)
  );

  const [dateTo, setDateTo] = useState<Date>(
    current_value.includes(":")
      ? new Date(parseFloat(current_value.split(":")[1]) * 1000)
      : new Date()
  );

  useEffect(() => {
    if (current_value.includes(":")) {
      setSelectedPeriodKind(PeriodKind.Range);
      const [from, to] = current_value.split(":");
      setDateFrom(new Date(parseFloat(from) * 1000));
      setDateTo(new Date(parseFloat(to) * 1000));
    } else {
      setSelectedPeriodKind(PeriodKind.Last);
      setLastPeriod(current_value.slice(-1) as PeriodValue);
      setNumber(parseInt(current_value.slice(0, -1)));
      setDateFrom(new Date(new Date().getTime() - 86_400_000));
      setDateTo(new Date());
    }
  }, [element_id, update_key]);

  const setParent = (
    n: number,
    last: PeriodValue,
    from: Date,
    to: Date,
    kind: PeriodKind
  ) => {
    if (kind == PeriodKind.Last) {
      setParam(`${n}${last}`);
    } else {
      const f = from.getTime() / 1000;
      const t = to.getTime() / 1000;
      setParam(`${f}:${t}`);
    }
  };

  const setPeriodKind = (event: SelectChangeEvent<PeriodKind>) => {
    const kind = event.target.value as PeriodKind;
    setSelectedPeriodKind(kind);
    setParent(number, lastPeriod, dateFrom, dateTo, kind);
  };

  const setNumberParam = (n: number) => {
    setNumber(n);
    setParent(n, lastPeriod, dateFrom, dateTo, selectedPeriodKind);
  };

  const setLastPeriodParam = (a: PeriodValue) => {
    setLastPeriod(a);
    setParent(number, a, dateFrom, dateTo, selectedPeriodKind);
  };

  const setFrom = (a: Date) => {
    setDateFrom(a);
    setParent(number, lastPeriod, a, dateTo, selectedPeriodKind);
  };

  const setTo = (a: Date) => {
    setDateTo(a);
    setParent(number, lastPeriod, dateFrom, a, selectedPeriodKind);
  };

  return (
    <div className="period-select-wrapper">
      <Select
        className="form-select"
        value={selectedPeriodKind}
        onChange={setPeriodKind}
      >
        {Object.values(PeriodKind).map((period) => (
          <MenuItem key={period} value={period}>
            {period}
          </MenuItem>
        ))}
      </Select>

      {selectedPeriodKind === PeriodKind.Last ? (
        <div className="period-select-item">
          <EditNumber
            element_id={`${element_id}-n`}
            current_value={number}
            setParam={setNumberParam}
            params={{ min: 1 }}
          />
          <SelectLastPeriod
            element_id={`${element_id}-lp`}
            current_value={lastPeriod}
            setParam={setLastPeriodParam}
          />
        </div>
      ) : selectedPeriodKind === PeriodKind.Range ? (
        <div className="period-select-item">
          <DateTimePickerSelect
            element_id={`${element_id}-d-from`}
            current_value={dateFrom}
            setParam={setFrom}
          />
          <DateTimePickerSelect
            element_id={`${element_id}-d-to`}
            current_value={dateTo}
            setParam={setTo}
          />
        </div>
      ) : null}
    </div>
  );
};
