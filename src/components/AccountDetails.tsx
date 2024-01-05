import { useState } from "react";
import InputField from "./editors/input_string";
import ErrorStatus from "./Error";
import { ButtonProfile } from "./mui/styles";

const AccountDetails = () => {
    const [error, setError] = useState<null | string>(null);

    const errorStatusChange = () => {
        setError("test");
    };

    return (
        <div className="profile__block">
            <h3>Account details</h3>
            <div className="profile__content">
                <InputField type="email" label="Email" />
                {error !== null ? <ErrorStatus message="Error" /> : null}
                <ButtonProfile variant="outlined" onClick={errorStatusChange}>
                    Set
                </ButtonProfile>
            </div>
        </div>
    );
};

export default AccountDetails;
