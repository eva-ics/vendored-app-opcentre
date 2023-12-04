import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState, useEffect } from "react";
import { SelectChangeEvent } from "@mui/material/Select";

const PERIOD_VALUE_NAMES = ["sec", "min", "hour", "day", "week"];

export enum PeriodValue {
  Second = "S",
  Minute = "T",
  Hour = "H",
  Day = "D",
  Week = "W"
}

export const SelectLastPeriod = ({
  element_id,
  update_key,
  current_value,
  setParam
}: {
  element_id: string;
  update_key?: any;
  current_value: PeriodValue;
  setParam: (a: PeriodValue) => void;
}) => {
  const [selectedPeriod, setSelectedPeriod] =
    useState<PeriodValue>(current_value);

  useEffect(() => {
    setSelectedPeriod(current_value);
  }, [element_id, update_key]);

  const handlePeriodChange = (event: SelectChangeEvent<PeriodValue>) => {
    const v = event.target.value as PeriodValue;
    setSelectedPeriod(v);
    setParam(v);
  };

  return (
    <>
      <Select
        className="form-select"
        value={selectedPeriod}
        onChange={handlePeriodChange}
        sx={{width:"70px"}}
      >
        {Object.values(PeriodValue).map((period, i) => (
          <MenuItem key={period} value={period}>
            {PERIOD_VALUE_NAMES[i]}
          </MenuItem>
        ))}
      </Select>
    </>
  );
};
