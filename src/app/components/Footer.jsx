'use client';
import Link from 'next/link';
import {
  BsFacebook,
  BsInstagram,
  BsTwitter,
  BsGithub,
  BsDribbble,
} from 'react-icons/bs';

export default function FooterCom() {
  return (
    <footer className='site-footer bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-t border-slate-200 dark:border-slate-700'>
      <div className='wrapper py-10'>
        <div className='grid gap-8 md:grid-cols-3'>
          <div>
            <Link href='/' className='inline-flex items-center gap-2'>
              <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white font-semibold'>
                Blog
              </span>
            </Link>
            <p className='mt-4 text-sm text-gray-600 dark:text-gray-300'>
              Blog chia sẻ bài viết, hướng dẫn và tài nguyên hữu ích.
            </p>
          </div>

          <div>
            <h4 className='font-semibold mb-3'>Liên kết</h4>
            <ul className='flex flex-col gap-2 text-sm'>
              <li>
                <Link href='/' className='hover:underline'>
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href='/about' className='hover:underline'>
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href='/dashboard/create-post'
                  className='hover:underline'
                >
                  Tạo bài viết
                </Link>
              </li>
              <li>
                <a href='/privacy' className='hover:underline'>
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-semibold mb-3'>Follow</h4>
            <p className='text-sm text-gray-600 dark:text-gray-300 mb-3'>
              Kết nối với chúng tôi trên mạng xã hội
            </p>
            <div className='flex items-center gap-3'>
              <a
                href='#'
                aria-label='Facebook'
                className='text-xl hover:text-teal-500'
              >
                <BsFacebook />
              </a>
              <a
                href='#'
                aria-label='Instagram'
                className='text-xl hover:text-teal-500'
              >
                <BsInstagram />
              </a>
              <a
                href='#'
                aria-label='Twitter'
                className='text-xl hover:text-teal-500'
              >
                <BsTwitter />
              </a>
              <a
                href='https://github.com'
                aria-label='Github'
                target='_blank'
                rel='noopener noreferrer'
                className='text-xl hover:text-teal-500'
              >
                <BsGithub />
              </a>
              <a
                href='#'
                aria-label='Dribbble'
                className='text-xl hover:text-teal-500'
              >
                <BsDribbble />
              </a>
            </div>
          </div>
        </div>

        <div className='mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 text-sm flex flex-col md:flex-row items-center justify-between gap-4'>
          <div>© {new Date().getFullYear()} Blog.</div>
          <div className='text-gray-500 text-sm'>
            ❤️
          </div>
        </div>
      </div>
    </footer>
  );
}