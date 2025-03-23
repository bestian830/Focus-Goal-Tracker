import Sidebar from "../components/Sidebar/Sidebar";
import GoalDetails from "../components/GoalDetails/GoalDetails";
import ProgressReport from "../components/ProgressReport/ProgressReport";
import Header from "../components/Header/Header";
import "../style/style.css";

function Home() {
  return (
    <div className="home-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <GoalDetails />
        <ProgressReport />
      </div>
    </div>
  );
}

export default Home;
