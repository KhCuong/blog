"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        // Gọi API tạo user (đã đổi đường dẫn)
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Sign up successful!');
                setTimeout(() => {
                    router.push('/sign-in');
                }, 1200);
            } else {
                setError(data.message || 'Sign up failed');
            }
        } catch {
            setError('Sign up failed');
        }


    };

    return (
        <div className='flex items-center justify-center p-3'>
            <form className='w-full max-w-md bg-white rounded-lg shadow-md p-6 flex flex-col gap-4' onSubmit={handleSubmit}>
                <h2 className='text-2xl font-bold text-center mb-4'>Đăng ký</h2>
                <input name='username' type='text' placeholder='Username' required className='border p-2 rounded' value={form.username} onChange={handleChange} />
                <input name='email' type='email' placeholder='Email' required className='border p-2 rounded' value={form.email} onChange={handleChange} />
                <input name='password' type='password' placeholder='Password' required className='border p-2 rounded' value={form.password} onChange={handleChange} />
                <button type='submit' className='bg-teal-500 text-white py-2 rounded font-semibold'>Đăng ký</button>
                {error && <div className='text-red-500 text-center'>{error}</div>}
                {success && <div className='text-green-500 text-center'>{success}</div>}
            </form>
        </div>
    );
}
