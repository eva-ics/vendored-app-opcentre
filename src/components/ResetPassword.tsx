import InputField from "./editors/input_field";
import { useState, ChangeEvent } from "react";
import StatusMessage from "./StatusMessage";
import { ButtonProfile } from "./mui/styles";
import { StatusType } from "../types";
import { Eva, EvaError } from "@eva-ics/webengine";
import { get_engine, FunctionLogout } from "@eva-ics/webengine-react";

const ResetPassword = ({ logout }: { logout: FunctionLogout }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [active, setActive] = useState(false);

    const onChangeOldPassword = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSaved(false);
        setError(null);
        setOldPassword(val);
    };

    const onChangeNewPassword = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSaved(false);
        setError(null);
        setNewPassword(val);
    };

    const onChangeNewPasswordConfirm = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSaved(false);
        setError(null);
        setNewPasswordConfirm(val);
    };

    const onClick = () => {
        setSaved(false);
        if (newPassword !== newPasswordConfirm) {
            setError("passwords do not match");
            return;
        }
        setError(null);
        setActive(true);
        (get_engine() as Eva)
            .call("set_password", {
                current_password: oldPassword,
                password: newPassword,
            })
            .then(() => {
                setActive(false);
                setSaved(true);
                setError(null);
                setTimeout(logout, 1000);
            })
            .catch((e: EvaError) => {
                if (e.code == -32002) {
                    setError("the current password does not match");
                    setOldPassword("");
                } else {
                    setError(e.message || "error setting password");
                }
                setSaved(false);
                setActive(false);
            });
    };

    const disabled = active;

    return (
        <div className="profile__block">
            <h3>Password</h3>
            <div className="profile__content">
                <InputField
                    type="password"
                    label="Current password"
                    current_value={oldPassword}
                    onChange={onChangeOldPassword}
                    onSubmit={onClick}
                />
                <InputField
                    type="password"
                    label="New password"
                    current_value={newPassword}
                    onChange={onChangeNewPassword}
                    onSubmit={onClick}
                />
                <InputField
                    type="password"
                    label="Confirm new password"
                    current_value={newPasswordConfirm}
                    onChange={onChangeNewPasswordConfirm}
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

export default ResetPassword;
