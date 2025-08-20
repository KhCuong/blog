'use client';
import { Button, Navbar } from 'flowbite-react';
import Link from 'next/link';
import { FaMoon, FaSun } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashSidebar from './DashSidebar';

export default function Header() {
  const path = usePathname();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Navbar className={`border-b-2 site-header fixed top-0 left-0 right-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
      {/* Logo */}
      <Link
        href='/'
        className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
      >
        <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
          Blog
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2 md:order-2 ml-auto">
        {/* Inline nav links (desktop only) placed immediately before theme button */}
        <div className="hidden md:flex items-center gap-3 mr-2">
          <Link href='/' className={`text-sm px-2 py-1 rounded ${path === '/' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}>
            Trang chủ
          </Link>
          <Link href='/about' className={`text-sm px-2 py-1 rounded ${path === '/about' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}>
            Giới thiệu
          </Link>
          <Link href='/dashboard/create-post' className={`text-sm px-2 py-1 rounded ${path === '/dashboard/create-post' ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}>
            Tạo bài viết
          </Link>
        </div>

        {/* Nút đổi theme */}
        <Button
          className='w-12 h-10 hidden sm:inline'
          color='gray'
          pill
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button>

        {/* User / Đăng nhập */}
        {user ? (
          <DashSidebar />
        ) : (
          <Link href='/sign-in'>
            <Button gradientDuoTone='purpleToBlue' outline>
              Đăng nhập
            </Button>
          </Link>
        )}

        <Navbar.Toggle />
      </div>
    </Navbar>
  );
}
