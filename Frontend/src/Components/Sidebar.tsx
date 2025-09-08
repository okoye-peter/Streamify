import { useLocation, Link } from "react-router";
import useGetAuthUser from "../hooks/useGetAuthUser";
import { ShipWheelIcon, HomeIcon, UsersIcon, BellIcon } from "lucide-react";


export const Sidebar = () => {
    const { authUser } = useGetAuthUser();
    const location = useLocation();
    const currentPath = location.pathname;
    return (
        <aside className="sticky top-0 flex-col hidden w-64 h-screen border-r bg-base-200 border-base-300 lg:flex">
            <div className="p-5 border-b border-base-300">
                <Link to="/" className="flex items-center gap-2.5">
                    <ShipWheelIcon className="size-9 text-primary" />
                    <span className="font-mono text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Streamify
                    </span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <Link
                    to="/"
                    className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/" ? "btn-active" : ""
                        }`}
                >
                    <HomeIcon className="size-5 text-base-content opacity-70" />
                    <span>Home</span>
                </Link>

                <Link
                    to="/friends"
                    className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/friends" ? "btn-active" : ""
                        }`}
                >
                    <UsersIcon className="size-5 text-base-content opacity-70" />
                    <span>Friends</span>
                </Link>

                <Link
                    to="/notifications"
                    className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/notifications" ? "btn-active" : ""
                        }`}
                >
                    <BellIcon className="size-5 text-base-content opacity-70" />
                    <span>Notifications</span>
                </Link>
            </nav>

            {/* USER PROFILE SECTION */}
            <div className="p-4 mt-auto border-t border-base-300">
                <div className="flex items-center gap-3">
                    <div className="avatar">
                        <div className="w-10 rounded-full">
                            <img src={authUser?.profilePicture} alt="User Avatar" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold">{authUser?.name}</p>
                        <p className="flex items-center gap-1 text-xs text-success">
                            <span className="inline-block rounded-full size-2 bg-success" />
                            Online
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
