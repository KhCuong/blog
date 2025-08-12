"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await fetch('/api/user/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsLoggedIn(true);
                window.dispatchEvent(new Event('userChanged'));
                router.push('/');
            } else {
                setError(data.message || 'Đăng nhập thất bại');
            }
        } catch {
            setError('Đăng nhập thất bại');
        }
    };

    return (
        <div className='flex items-center justify-center p-3'>
            <form className='w-full max-w-md bg-white rounded-lg shadow-md p-6 flex flex-col gap-4' onSubmit={handleSubmit}>
                <h2 className='text-2xl font-bold text-center mb-4'>Sign In</h2>
                <input name='email' type='email' placeholder='Email' required className='border p-2 rounded' value={form.email} onChange={handleChange} />
                <input name='password' type='password' placeholder='Password' required className='border p-2 rounded' value={form.password} onChange={handleChange} />
                <button type='submit' className='bg-teal-500 text-white py-2 rounded font-semibold'>Sign In</button>
                {error && <div className='text-red-500 text-center'>{error}</div>}
                {success && <div className='text-green-500 text-center'>{success}</div>}
                <div className='text-center mt-2'>
                    <span>Bạn chưa có tài khoản? </span>
                    <Link href='/sign-up' className='text-teal-600 font-semibold hover:underline'>Đăng ký</Link>
                </div>
            </form>
        </div>
    );
}
