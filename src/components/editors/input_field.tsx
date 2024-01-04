import { TextField } from "@mui/material";
import { ChangeEvent } from "react";

const InputField = ({
    type,
    current_value,
    label,
    onChange,
    readOnly,
    onSubmit,
}: {
    type: string;
    current_value: string;
    label?: string;
    readOnly?: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit?: () => void;
}) => {
    return (
        <div className="profile-input-wrapper">
            <p>{label}</p>
            <TextField
                fullWidth
                type={type}
                value={current_value}
                onChange={onChange}
                onKeyPress={(e) => {
                    if (e.key === "Enter" && onSubmit) {
                        onSubmit();
                    }
                }}
                InputProps={{
                    ...(readOnly && { readOnly: true }),
                }}
            />
        </div>
    );
};

export default InputField;
