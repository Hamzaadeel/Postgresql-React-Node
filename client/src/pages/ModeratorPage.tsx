import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";

const ModeratorPage = () => {
  return (
    <div className="flex h-screen">
      <Sidebar userRole="Moderator" />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ModeratorPage;
