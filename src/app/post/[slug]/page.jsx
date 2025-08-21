import RecentPosts from '@/app/components/RecentPosts';
import { Button } from 'flowbite-react';
import Link from 'next/link';

// helper: build absolute URL for server-side fetch
const getAbsoluteUrl = (p = '/api/post/get') => {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
  return `${base}${p.startsWith('/') ? p : '/' + p}`;
};

export default async function PostPage({ params }) {
  let post = null;
  const awaitedParams = typeof params?.then === 'function' ? await params : params;
  const slug = awaitedParams?.slug;
  try {
    const result = await fetch(getAbsoluteUrl('/api/post/get'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      cache: 'no-store',
    });
    const data = await result.json();
    post = data.posts[0];
  } catch (error) {
    post = { title: 'Không tải được bài viết' };
  }

  if (!post || post.title === 'Không tải được bài viết') {
    return (
      <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
        <h2 className='text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl'>
          Không tìm thấy bài viết
        </h2>
      </main>
    );
  }

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      <h1 className='text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl'>
        {post && post.title}
      </h1>
      <Link
        href={`/search?category=${post && post.category}`}
        className='self-center mt-5'
      >
        <Button color='gray' pill size='xs'>
          {post && post.category}
        </Button>
      </Link>

      <img
        src={post && post.image}
        alt={post && post.title}
        className='mt-10 p-3 max-h-[600px] w-full object-cover'
      />

      <div className='flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs'>
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        {/* <span className='italic'>
          {post && (post?.content?.length / 1000).toFixed(0)} phút đọc
        </span> */}
      </div>

      <div className="flex justify-center w-full">
        <div
          className="post-content prose prose-lg whitespace-pre-wrap bg-white rounded-lg shadow-md p-6 max-w-2xl w-full"
          dangerouslySetInnerHTML={{ __html: post?.content }}
        ></div>
      </div>

      <div className='max-w-4xl mx-auto w-full'></div>

      <RecentPosts limit={2} />
    </main>
  );
}
