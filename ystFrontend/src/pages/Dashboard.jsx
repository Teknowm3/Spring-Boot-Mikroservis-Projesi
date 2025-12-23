import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import { LogOut } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();

    // Fallback/Loading state could be added here
    if (!user) {
        return <div className="p-8">Loading user data...</div>;
    }

    const isAdmin = user.role === 'Admin' ||
        user.role === 'ADMIN' ||
        user.roles?.includes('ROLE_ADMIN') ||
        user.roles?.includes('ADMIN') ||
        user.authorities?.includes('ROLE_ADMIN') ||
        user.authorities?.includes('ADMIN');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Common Header if desirable, or logic inside components */}
            {/* Adding a simple mobile logout for UserDashboard reused layout, 
                AdminDashboard has its own layout. 
                We'll conditionally render the whole page structure. */}

            {isAdmin ? (
                <AdminDashboard />
            ) : (
                <div className="min-h-screen flex flex-col">
                    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
                        <div className="font-bold text-xl text-indigo-700">My App</div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-700 font-medium">{user.name || user.username}</span>
                            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 transition" title="Logout">
                                <LogOut className="h-6 w-6" />
                            </button>
                        </div>
                    </header>
                    <main className="flex-1 p-6">
                        <UserDashboard />
                    </main>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
