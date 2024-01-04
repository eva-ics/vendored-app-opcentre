import { useState, useEffect, ChangeEvent } from "react";
import InputField from "./editors/input_field";
import StatusMessage from "./StatusMessage";
import { ButtonProfile } from "./mui/styles";
import { StatusType } from "../types";
import { Eva, EvaError } from "@eva-ics/webengine";
import { get_engine } from "@eva-ics/webengine-react";

interface FieldValue {
    value: any;
    readonly: boolean;
}

const AccountDetails = () => {
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [readonly, setReadonly] = useState(false);
    const [saved, setSaved] = useState(false);
    const [active, setActive] = useState(false);

    useEffect(() => {
        setInputValue("");
        setSaved(false);
        (get_engine() as Eva)
            .call("profile.get_field", { field: "email" })
            .then((r: FieldValue) => {
                setReadonly(r.readonly);
                setInputValue(r.value || "");
                setLoaded(true);
            })
            .catch((e: EvaError) => {
                setError(e.message || "error loading data");
            });
    }, []);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSaved(false);
        setError(null);
        setInputValue(val);
    };

    const onClick = () => {
        setActive(true);
        setError(null);
        setSaved(false);
        (get_engine() as Eva)
            .call("profile.set_field", { field: "email", value: inputValue })
            .then(() => {
                setActive(false);
                setSaved(true);
                setError(null);
            })
            .catch((e: EvaError) => {
                setError(e.message || "error setting data");
                setSaved(false);
                setActive(false);
            });
    };

    const disabled = !loaded || readonly || active;

    return (
        <div className="profile__block">
            <h3>Account details</h3>
            <div className="profile__content">
                <InputField
                    type="email"
                    label="Email"
                    current_value={inputValue}
                    onChange={onChange}
                    onSubmit={onClick}
                />
                <ButtonProfile variant="outlined" disabled={disabled} onClick={onClick}>
                    Set
                </ButtonProfile>
                {error !== null ? (
                    <StatusMessage message={error} type={StatusType.Error} />
                ) : null}
                {saved && <StatusMessage message="Success" type={StatusType.Success} />}
            </div>
        </div>
    );
};

export default AccountDetails;
