"use client"

import { useEffect, useState } from 'react';

export default function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const updateUser = () => {
            const storedUser = localStorage.getItem('user');
            setUser(storedUser ? JSON.parse(storedUser) : null);
        };
        updateUser();
        window.addEventListener('userChanged', updateUser);
        return () => {
            window.removeEventListener('userChanged', updateUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('userChanged'));
    };

    if (!user) {
        return <div className='text-center mt-10'>Bạn chưa đăng nhập.</div>;
    }

    return (
        <div className='max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-10'>
            <h2 className='text-2xl font-bold mb-4 text-center'>Profile</h2>
            <div className='mb-2'><strong>Username:</strong> {user.username}</div>
            <div className='mb-2'><strong>Email:</strong> {user.email}</div>
            <div className='mb-2'><strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}</div>

        </div>
    );
}
