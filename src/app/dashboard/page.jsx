"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashProfile from "../components/DashProfile";
import DashPosts from "../components/DashPosts";
import DashUsers from "../components/DashUsers";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = searchParams.get("tab") || "profile";
    setTab(t);
    const raw = localStorage.getItem("user");
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
    const onUserChanged = () => {
      const raw2 = localStorage.getItem("user");
      setUser(raw2 ? JSON.parse(raw2) : null);
    };
    window.addEventListener("userChanged", onUserChanged);
    return () => window.removeEventListener("userChanged", onUserChanged);
  }, [searchParams]);

  return (
    <div className='flex flex-row min-h-screen'>
      {/* Thanh điều hướng dọc */}
      <div className='w-48 min-h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col gap-2 py-8 bg-white dark:bg-gray-900'>
        <button
          className={`w-full text-left px-6 py-3 rounded-l ${tab === 'profile' ? 'bg-white dark:bg-gray-800 border-l-4 border-teal-500 font-semibold' : 'bg-gray-100 dark:bg-gray-700'}`}
          onClick={() => router.push('/dashboard?tab=profile')}
        >
          Hồ sơ
        </button>
        <button
          className={`w-full text-left px-6 py-3 rounded-l ${tab === 'posts' ? 'bg-white dark:bg-gray-800 border-l-4 border-teal-500 font-semibold' : 'bg-gray-100 dark:bg-gray-700'}`}
          onClick={() => router.push('/dashboard?tab=posts')}
        >
          Bài viết
        </button>
        {user?.isAdmin && (
          <button
            className={`w-full text-left px-6 py-3 rounded-l ${tab === 'users' ? 'bg-white dark:bg-gray-800 border-l-4 border-teal-500 font-semibold' : 'bg-gray-100 dark:bg-gray-700'}`}
            onClick={() => router.push('/dashboard?tab=users')}
          >
            Người dùng
          </button>
        )}
      </div>
      {/* Nội dung tab */}
      <div className='flex-1 p-6'>
        {tab === 'profile' && <DashProfile />}
        {tab === 'posts' && <DashPosts />}
        {tab === 'users' && user?.isAdmin && <DashUsers />}
      </div>
    </div>
  );
}