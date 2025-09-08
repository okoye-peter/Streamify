import { Sidebar } from "../Components/Sidebar.tsx";
import React, { type ReactNode } from "react";
import { Navbar } from "../Components/Navbar.tsx";

type AuthLayoutProps = {
    children: ReactNode;
    showSideBar?: boolean;
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    showSideBar = false,
}) => {
    return (
        <div className="min-h-screen">
            <div className="flex">
                {/* sidebar */}
                {showSideBar && <Sidebar />}
                <div className="flex flex-col flex-1">
                    {/* navbar */}
                    <Navbar />
                    <main className="flex-1 overflow-y-auto">{children}</main>
                </div>
            </div>
        </div>
    );
};
