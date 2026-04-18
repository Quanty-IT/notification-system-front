import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, LayoutTemplate, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/auth-context/auth-context';
import logo from '../assets/logo.png';

const NAV_ITEMS = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/send-new', label: 'Send New', icon: PlusSquare },
    { to: '/templates', label: 'Templates', icon: LayoutTemplate },
];

export const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            className="group group/sidebar fixed left-0 top-0 z-50 flex h-screen w-20 shrink-0 flex-col bg-[#367C2B] shadow-2xl transition-all duration-300 ease-in-out hover:w-48"
        >
            <div className="flex h-20 shrink-0 items-center gap-4 border-b border-white/10 pl-5 pr-4">
                <img
                    src={logo}
                    alt="John Deere"
                    className="w-12 h-12 shrink-0 object-contain"
                />
                <span className="whitespace-nowrap text-2xl font-extrabold tracking-tight text-[#FFDE00] opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                    JD Notify
                </span>
            </div>

            <nav className="flex flex-1 flex-col gap-2 px-2 py-6">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `group flex items-center gap-4 rounded-2xl py-4 pl-5 pr-4 text-sm font-bold transition-all duration-200 ${isActive
                                ? 'scale-[0.97] bg-[#285c20] text-white shadow-[inset_0px_4px_6px_rgba(0,0,0,0.3)]'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`
                        }
                    >
                        <Icon
                            size={20}
                            className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                        />
                        <span className="truncate opacity-0 transition-all duration-200 group-hover/sidebar:opacity-100 group-hover:translate-x-1">{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="px-2 pb-8">
                <button
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-4 rounded-2xl py-4 pl-5 pr-4 text-sm font-bold text-white/70 transition-all hover:bg-red-900/20 hover:text-white"
                >
                    <LogOut size={20} className="shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                    <span className="opacity-0 transition-all duration-200 group-hover/sidebar:opacity-100 group-hover:translate-x-1">Logout</span>
                </button>
            </div>
        </aside>
    );
};