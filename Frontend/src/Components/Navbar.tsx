import { useLocation } from "react-router";
import useGetAuthUser from "../hooks/useGetAuthUser"
import { useLogout } from "../hooks/useLogout";
import { Link } from "react-router";
import { 
    ShipWheelIcon,
    BellIcon,
    LogOutIcon
    
} from "lucide-react"
import { ThemeSelector } from "./ThemeSelector.tsx";


export const Navbar = () => {
    const { authUser } = useGetAuthUser();
    const { pathname } = useLocation();
    const isChatPage:boolean  = pathname.includes("/chat");
    const { logoutMutation } = useLogout();

    return (
        <nav className="sticky top-0 z-30 flex items-center h-16 border-b bg-base-200 border-base-300">
            <div className="container px-4 mx-auto sm:px-6 lg:px-8">
                <div className="flex items-center justify-end w-full">
                    {/* LOGO - ONLY IN THE CHAT PAGE */}
                    {isChatPage && (
                        <div className="pl-5">
                            <Link to="/" className="flex items-center gap-2.5">
                                <ShipWheelIcon className="size-9 text-primary" />
                                <span className="font-mono text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                    Streamify
                                </span>
                            </Link>
                        </div>
                    )}

                    <div className="flex items-center gap-3 ml-auto sm:gap-4">
                        <Link to={"/notifications"}>
                            <button className="btn btn-ghost btn-circle">
                                <BellIcon className="w-6 h-6 text-base-content opacity-70" />
                            </button>
                        </Link>
                    </div>

                    {/* TODO */}
                    <ThemeSelector />

                    <div className="avatar">
                        <div className="rounded-full w-9">
                            <img src={authUser?.profilePicture} alt="User Avatar" rel="noreferrer" />
                        </div>
                    </div>

                    {/* Logout button */}
                     <button className="btn btn-ghost btn-circle" onClick={() => logoutMutation()}>
                        <LogOutIcon className="w-6 h-6 text-base-content opacity-70" />
                    </button>
                </div>
            </div>
        </nav>
    )
}
