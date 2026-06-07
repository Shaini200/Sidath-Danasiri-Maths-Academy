import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, UserPlus, CreditCard, DollarSign, User, LogOut } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="w-64 bg-gray-900 text-white h-full flex flex-col shadow-xl">
            <div className="p-6 text-2xl font-bold border-b border-gray-800 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                SIDATH DANASIRI MATHS ACADEMHY
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/dashboard" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/students" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                    <Users size={20} />
                    <span>Students</span>
                </NavLink>

                {user?.role === 'Admin' && (
                    <NavLink to="/students/register" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                        <UserPlus size={20} />
                        <span>Register Student</span>
                    </NavLink>
                )}

                <NavLink to="/payments" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                    <CreditCard size={20} />
                    <span>Payments</span>
                </NavLink>

                {user?.role === 'Admin' && (
                    <NavLink to="/income" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                        <DollarSign size={20} />
                        <span>Income</span>
                    </NavLink>
                )}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <NavLink to="/profile" className={({ isActive }) => `flex items-center space-x-3 p-3 rounded-lg transition-colors mb-2 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
                    <User size={20} />
                    <span>Profile</span>
                </NavLink>
                <button onClick={logout} className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
