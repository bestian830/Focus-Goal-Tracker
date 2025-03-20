import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GuestLogin from "./pages/GuestLogin";
import Home from "./pages/Home";
import "./App.css";

function App() {
  // check if user is authenticated
  const isAuthenticated = () => {
    return localStorage.getItem("userId") !== null;
  };

  return (
    <Router>
      <Routes>
        {/* route for guest login */}
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" /> : <GuestLogin />}
        />

        {/* Main Page Route - need guest authen */}
        <Route
          path="/"
          element={isAuthenticated() ? <Home /> : <Navigate to="/login" />}
        />

        {/* 默认重定向到登录页面 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
