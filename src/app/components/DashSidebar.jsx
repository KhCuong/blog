'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
export default function DashSidebar() {
  const [tab, setTab] = useState('');
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  // Đảm bảo hooks luôn được gọi đúng thứ tự
  const [showDropdown, setShowDropdown] = useState(false);
  const avatarRef = useRef(null);

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
  }, [searchParams]);
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [searchParams]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  if (!user) {
    return (
      <div className='p-4 text-center'>Bạn chưa đăng nhập.</div>
    );
  }

  // ...existing code...
  // Sidebar menu cho admin
  return (
    <div className='w-full md:w-56 pt-6'>
      <img
        src={user.profilePicture || '/avatar.png'}
        alt='avatar'
        className='mx-auto mb-4 w-16 h-16 rounded-full border-2 border-teal-500 object-cover shadow-lg'
      />
      <Sidebar className='w-full'>
        <Sidebar.Items>
          <Sidebar.ItemGroup className='flex flex-col gap-1'>
            {user?.publicMetadata?.isAdmin && (
              <Link href='/dashboard?tab=dash'>
                <Sidebar.Item
                  active={tab === 'dash' || !tab}
                  icon={HiChartPie}
                  as='div'
                >
                  Dashboard
                </Sidebar.Item>
              </Link>
            )}
            <Link href='/dashboard?tab=profile'>
              <Sidebar.Item
                active={tab === 'profile'}
                icon={HiUser}
                label={user?.publicMetadata?.isAdmin ? 'Admin' : 'User'}
                labelColor='dark'
                as='div'
              >
                Profile
              </Sidebar.Item>
            </Link>
            {user?.publicMetadata?.isAdmin && (
              <Link href='/dashboard?tab=posts'>
                <Sidebar.Item
                  active={tab === 'posts'}
                  icon={HiDocumentText}
                  as='div'
                >
                  Posts
                </Sidebar.Item>
              </Link>
            )}
            {user?.publicMetadata?.isAdmin && (
              <Link href='/dashboard?tab=users'>
                <Sidebar.Item
                  active={tab === 'users'}
                  icon={HiOutlineUserGroup}
                  as='div'
                >
                  Users
                </Sidebar.Item>
              </Link>
            )}
            <Sidebar.Item icon={HiArrowSmRight} className='cursor-pointer'>
              <button
                className='w-full text-left px-2 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded'
                onClick={() => {
                  localStorage.removeItem('user');
                  window.dispatchEvent(new Event('userChanged'));
                  window.location.href = '/';
                }}
              >
                Sign out
              </button>
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
}
