import { TextField } from "@mui/material";
import { useState } from "react";

const InputField = ({
    type,
    current_value,
    label,
}: {
    type: string;
    current_value: string;
    label?: string;
}) => {
    const [input_value, setInputValue] = useState(current_value);

    return (
        <div className="profile-input-wrapper">
            <p>{label}</p>
            <TextField
                fullWidth
                type={type}
                value={input_value}
                onChange={(e) => {
                    const val = e.target.value;
                    setInputValue(val);
                }}
            />
        </div>
    );
};

export default InputField;
