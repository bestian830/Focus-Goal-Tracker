import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <h2>Goal Tracker</h2>
      <img
        src="../../public/avatar.png"
        alt="Profile"
        className="avatar"
        onClick={() => navigate("/profile")}
      />
    </header>
  );
}
