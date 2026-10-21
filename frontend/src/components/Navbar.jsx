
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">R</div>
                <div>
                    <h2>Roots Media</h2>
                    <p>Management Portal</p>
                </div>
            </div>

            <div className="nav-section-label">WORKSPACE</div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className="nav-link">
                    <span className="nav-icon">▦</span>
                    Dashboard
                </NavLink>

                <NavLink to="/employees" className="nav-link">
                    <span className="nav-icon">♙</span>
                    Employees
                </NavLink>

                <NavLink to="/tasks" className="nav-link">
                    <span className="nav-icon">☷</span>
                    Tasks
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                Employee & Task Management
            </div>
        </aside>
    );
}

export default Navbar;
