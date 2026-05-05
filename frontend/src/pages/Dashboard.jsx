import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, CreditCard, GraduationCap, Clock } from 'lucide-react';
import axios from 'axios';
import RecentActivity from '../components/RecentActivity';

const Dashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [stats, setStats] = useState({ students: 0, payments: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (user?.role === 'Admin') {
                    const res = await axios.get('http://localhost:5000/api/students', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setStats(prev => ({ ...prev, students: res.data.length }));
                }
                const payRes = await axios.get('http://localhost:5000/api/payments/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(prev => ({ ...prev, payments: payRes.data.length }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, [user, token]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Welcome back, <span className="font-semibold text-blue-600">{user?.username}</span>!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {user?.role === 'Admin' && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Students</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.students}</p>
                        </div>
                    </div>
                )}
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">{user?.role === 'Admin' ? 'Total Payments' : 'My Payments'}</p>
                        <p className="text-2xl font-bold text-gray-800">{stats.payments}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Academic Year</p>
                        <p className="text-2xl font-bold text-gray-800">2026</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">System Status</p>
                        <p className="text-lg font-bold text-green-500">Active</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* You can add charts or other content here later */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <GraduationCap className="mr-2 text-blue-600" size={24} />
                            Academic Overview
                        </h2>
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <div className="p-4 bg-gray-50 rounded-full mb-4">
                                <Users size={48} className="text-gray-300" />
                            </div>
                            <p className="text-lg font-medium">Statistics Visualization Coming Soon</p>
                            <p className="text-sm">We are preparing detailed analytics for your dashboard.</p>
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-1">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
