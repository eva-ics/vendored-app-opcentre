import AccountDetails from "../components/AccountDetails";
import ResetPassword from "../components/ResetPassword";
import { FunctionLogout } from "@eva-ics/webengine-react";

const Profile = ({ logout }: { logout: FunctionLogout }) => {
    return (
        <div className="profile">
            <ResetPassword logout={logout} />
            <AccountDetails />
        </div>
    );
};

export default Profile;
