import { Button, styled } from "@mui/material";
import InputField from "../components/editors/input_string";

//mui styles
const ButtonProfile = styled(Button)({
    color: "gray",
    borderColor: "gray",
    "&:hover": {
        color: "white",
        borderColor: "white",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
});

const Profile = () => {
    return (
        <div className="profile">
            <div className="profile__block">
                <h3>Password</h3>
                <div className="profile__content">
                    <InputField type="text" label="Current password" />
                    <InputField type="text" label="New password" />
                    <InputField type="text" label="Confirm new password" />
                    <ButtonProfile variant="outlined">Set</ButtonProfile>
                </div>
            </div>
            <div className="profile__block">
                <h3>Account details</h3>
                <div className="profile__content">
                    <InputField type="email" label="Email" />
                    <ButtonProfile variant="outlined">Set</ButtonProfile>
                </div>
            </div>
        </div>
    );
};

export default Profile;
