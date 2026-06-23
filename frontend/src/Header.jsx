import { Bell } from "lucide-react";
import "./Header.css";

function Header({ time }) {
  return (
    <header className="header-bar">
      <div className="header-title">
        <h2>Bengaluru Traffic Command Center</h2>
      </div>
      <div className="header-right-items">
        <span className="header-time">{time}</span>
        <div className="notification-bell">
          <Bell size={20} />
          <div className="notification-dot" />
        </div>
      </div>
    </header>
  );
}

export default Header;