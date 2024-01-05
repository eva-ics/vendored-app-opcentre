import InputField from "./editors/input_string";
import { useState } from "react";
import ErrorStatus from "./Error";
import { ButtonProfile } from "./mui/styles";

const ResetPassword = () => {
    const [error, setError] = useState<null | string>(null);

    const errorStatusChange = () => {
        setError("test");
    };

    return (
        <div className="profile__block">
            <h3>Password</h3>
            <div className="profile__content">
                <InputField type="text" label="Current password" />
                <InputField type="text" label="New password" />
                <InputField type="text" label="Confirm new password" />
                {error !== null ? <ErrorStatus message="Error" /> : null}
                <ButtonProfile variant="outlined" onClick={errorStatusChange}>
                    Set
                </ButtonProfile>
            </div>
        </div>
    );
};

export default ResetPassword;
