
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import "./AppLayout.css";

function AppLayout() {
    return (
        <div className="app-layout">
            <Navbar />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;
