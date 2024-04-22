import AccountDetails from "../components/AccountDetails";
import ResetPassword from "../components/ResetPassword";
import { FunctionLogout } from "@eva-ics/webengine-react";

const Profile = ({ logout }: { logout: FunctionLogout }) => {
    return (
        <div className="profile">
            <ResetPassword logout={logout} />
            <div className="profile__block">
                <h3>Account details</h3>
                <AccountDetails field="email" />
                <AccountDetails field="phone" />
            </div>
        </div>
    );
};

export default Profile;
