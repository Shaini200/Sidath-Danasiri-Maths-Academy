import React from 'react';
import { UserPlus, CreditCard, UserCheck, Bell } from 'lucide-react';

const activities = [
    {
        id: 1,
        type: 'registration',
        user: 'Sarah Johnson',
        action: 'registered as a new student',
        time: '2 hours ago',
        icon: <UserPlus className="text-blue-500" size={18} />,
        bgColor: 'bg-blue-50'
    },
    {
        id: 2,
        type: 'payment',
        user: 'Michael Chen',
        action: 'completed monthly fee payment',
        time: '4 hours ago',
        icon: <CreditCard className="text-emerald-500" size={18} />,
        bgColor: 'bg-emerald-50'
    },
    {
        id: 3,
        type: 'update',
        user: 'Admin',
        action: 'updated the class schedule for Grade 3',
        time: 'Yesterday',
        icon: <UserCheck className="text-purple-500" size={18} />,
        bgColor: 'bg-purple-50'
    },
];

const RecentActivity = () => {
    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Image Banner Section */}
            <div className="relative h-48 overflow-hidden group">
                <img
                    src="/assets/banner.png"
                    alt="Education Banner"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-center space-x-2 text-white/90 mb-1">
                        <Bell size={16} className="animate-bounce" />
                        <span className="text-xs font-medium uppercase tracking-wider">Live Updates</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">Recent Student Activities</h3>
                    <p className="text-white/70 text-sm">Stay updated with the latest campus events</p>
                </div>
            </div>

            {/* Activities List Section */}
            <div className="p-6">
                <div className="space-y-6">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="flex items-start space-x-4 group cursor-pointer"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className={`p-3 rounded-xl ${activity.bgColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                {activity.icon}
                            </div>
                            <div className="flex-1 border-b border-gray-50 pb-4 group-last:border-0 group-last:pb-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-gray-800 text-sm">
                                        {activity.user}
                                    </h4>
                                    <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                        {activity.time}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activity.action}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-8 py-3 px-4 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-semibold text-sm rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-100 hover:border-blue-100">
                    <span>View All Activities</span>
                </button>
            </div>
        </div>
    );
};

export default RecentActivity;
