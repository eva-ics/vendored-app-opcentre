import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import "dayjs/locale/de";

const DateTimePickerSelect = ({
    element_id,
    update_key,
    current_value,
    setParam,
    enabled,
}: {
    element_id: string;
    update_key?: any;
    current_value: Date;
    setParam: (v: Date) => void;
    enabled?: boolean;
}) => {
    const [value, setValue] = useState<Dayjs | null>(dayjs(current_value));

    useEffect(() => {
        setValue(dayjs(current_value));
    }, [element_id, update_key]);

    const handleChange = (v: Dayjs | null) => {
        setValue(v);
        setParam(v?.toDate() || new Date());
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                label=""
                disabled={enabled == false}
                value={value}
                onChange={handleChange}
                views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                timeSteps={{ minutes: 1 }}
            />
        </LocalizationProvider>
    );
};

export default DateTimePickerSelect;
