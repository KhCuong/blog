'use client';


import { HiUser } from 'react-icons/hi2'; // import riêng nếu nó ở hi2

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';


// Custom useUser hook to mimic Clerk
function useUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    updateUser();
    window.addEventListener('userChanged', updateUser);
    return () => window.removeEventListener('userChanged', updateUser);
  }, []);
  return { user };
}
export default function DashSidebar() {
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const dropdownRef = useRef(null);
  const accountMenuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  if (!user) {
    return <div className='p-4 text-center'>Bạn chưa đăng nhập.</div>;
  }

  return (
    <div className='w-auto pt-6 flex flex-col items-center'>
      <div className='relative w-full bottom-[5px] flex flex-col items-center'>
        <img
          src={user.profilePicture || '/avatar.png'}
          alt='avatar'
          className='mx-auto mb-4 w-10 h-10 rounded-full border-2 border-teal-500 object-cover shadow-lg cursor-pointer transition-transform hover:scale-105'
          onClick={() => setShowDropdown((prev) => !prev)}
        />
        {showDropdown && (
          <>
            <div
              className='fixed inset-0 bg-black bg-opacity-20 z-40'
              onClick={() => {
                setShowDropdown(false);
                setShowAccountMenu(false);
              }}
            />
            <div
              ref={dropdownRef}
              className='absolute left-1/2 -translate-x-1/2 mt-2 w-60 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-1'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1'>
                <HiUser className='text-teal-500' />
                <span className='font-semibold'>{user.username}</span>
              </div>
              <button
                className='block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold'
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/dashboard?tab=profile');
                }}
              >
                Quản lý tài khoản
              </button>
              <button
                className='block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-2'
                onClick={() => {
                  setShowDropdown(false);
                  setShowAccountMenu(false);
                  localStorage.removeItem('user');
                  window.dispatchEvent(new Event('userChanged'));
                  router.replace('/');
                }}
              >
                Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
