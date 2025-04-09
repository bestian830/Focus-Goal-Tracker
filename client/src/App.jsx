import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GuestLogin from "./pages/GuestLogin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import "./styles/GlobalStyles.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/guest-login" element={<GuestLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Page Route - no authentication required */}
        <Route path="/" element={<Home />} />
        
        {/* Profile Page Route */}
        <Route path="/profile" element={<Profile />} />

        {/* Default redirect to home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
