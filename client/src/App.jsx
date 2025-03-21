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
  return (
    <Router>
      <Routes>
        {/* route for guest login */}
        <Route path="/login" element={<GuestLogin />} />

        {/* Main Page Route - no authentication required */}
        <Route path="/" element={<Home />} />

        {/* Default redirect to home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
