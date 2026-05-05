import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UploadCloud } from 'lucide-react';

const Payment = () => {
    const { token, user } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        student_id: user?.role === 'Student' ? user.username : '',
        bank: '',
        method: 'Bank Transfer',
        month: 'January',
        date: new Date().toISOString().split('T')[0],
        amount: ''
    });
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const fetchPayments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/payments/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [token]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a file');
            return;
        }

        const data = new FormData();
        data.append('slip', file);
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        setUploading(true);
        setMessage('');

        try {
            await axios.post('http://localhost:5000/api/payments/upload', data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Payment uploaded successfully!');
            setFile(null);
            fetchPayments();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Payments</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Upload Payment Slip</h2>
                    {message && <div className={`p-3 rounded mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
                    <form onSubmit={handleUpload} className="space-y-4">
                        {user?.role === 'Admin' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                <input type="text" value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                            <input type="text" value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                            <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                <select value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <option key={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slip Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                                <div className="space-y-1 text-center">
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                            <span>Upload a file</span>
                                            <input id="file-upload" type="file" className="sr-only" onChange={e => setFile(e.target.files[0])} accept="image/*" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">{file ? file.name : 'PNG, JPG up to 5MB'}</p>
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {uploading ? 'Uploading...' : 'Submit Payment'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold">Payment History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    {user?.role === 'Admin' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slip</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(p.date).toLocaleDateString()}</td>
                                        {user?.role === 'Admin' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.name} ({p.student_id})</td>}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.month}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.bank}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs. {p.amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            <a href={`http://localhost:5000/${p.slip_path.replace(/\\/g, '/')}`} target="_blank" rel="noreferrer" className="hover:underline">View Slip</a>
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && <tr><td colSpan={user?.role === 'Admin' ? 5 : 4} className="p-6 text-center text-gray-500">No payment history found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
