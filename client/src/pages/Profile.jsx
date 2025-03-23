import ProfileInfo from '../components/Profile/ProfileInfo';
import ChangePassword from '../components/Profile/ChangePassword';
import '../style/style.css';

export default function Profile() {
    return (
        <div className="profile-container">
            <ProfileInfo />
            <ChangePassword />
        </div>
    );
}