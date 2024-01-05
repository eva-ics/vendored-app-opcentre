import AccountDetails from "../components/AccountDetails";
import ResetPassword from "../components/ResetPassword";

const Profile = () => {
    return (
        <div className="profile">
            <ResetPassword />
            <AccountDetails />
        </div>
    );
};

export default Profile;
