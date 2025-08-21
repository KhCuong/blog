"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Đăng ký thành công!');
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
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <form
                className="w-full max-w-md bg-white dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-700 shadow-lg rounded-2xl p-8"
                onSubmit={handleSubmit}
                aria-label="Sign up form"
            >
                <h2 className="text-center text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Tạo tài khoản</h2>
                <p className="text-center text-sm text-gray-500 dark:text-slate-400 mb-6">Tạo tài khoản mới để đăng bài và quản lý nội dung.</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Họ và tên</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Nguyễn Văn A"
                            value={form.username}
                            onChange={handleChange}
                            className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Mật khẩu</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="appearance-none block w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl bg-gradient-to-r from-teal-400 to-blue-500 text-white font-semibold shadow hover:opacity-95 transition"
                    >
                        Đăng ký
                    </button>
                </div>

                {error && <div className="mt-4 text-center text-sm text-red-500" role="alert">{error}</div>}
                {success && <div className="mt-4 text-center text-sm text-emerald-500">{success}</div>}

                <div className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
                    <span>Đã có tài khoản? </span>
                    <Link href="/sign-in" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">Đăng nhập</Link>
                </div>
            </form>
        </div>
    );
}
