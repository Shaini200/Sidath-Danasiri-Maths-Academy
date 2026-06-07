import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, ShieldCheck } from 'lucide-react';

const Profile = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="px-8 pb-8 relative">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg absolute -top-12 border-4 border-white">
                        <User size={48} className="text-gray-400" />
                    </div>
                    
                    <div className="pt-16">
                        <h2 className="text-2xl font-bold text-gray-900">{user?.username}</h2>
                        <p className="text-gray-500 flex items-center mt-1">
                            <ShieldCheck size={16} className="mr-2 text-blue-500" />
                            Role: {user?.role}
                        </p>
                    </div>

                    <div className="mt-8 border-t pt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Username / ID</p>
                                <p className="font-medium text-gray-900">{user?.username}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">Account Status</p>
                                <p className="font-medium text-green-600">Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
