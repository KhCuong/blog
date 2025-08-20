import Link from 'next/link';
export default async function RecentPosts({ limit = 2 }) {
  let posts = null;
  try {
    const base = process.env.NEXT_PUBLIC_URL || process.env.URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);
    const result = await fetch(`${base}/api/post/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: limit, order: 'desc' }),
      cache: 'no-store',
    });
    const data = await result.json();
    posts = data.posts;
  } catch (error) {
    console.log('Error getting post:', error);
  }

  return (
    <div className='recent-posts w-full'>
      <h2 className='text-lg font-semibold mb-3'>Bài viết gần đây</h2>
      <div className='flex flex-col gap-3'>
        {posts && posts.slice(0, limit).map(post => (
          <article key={post.id || post._id || post.slug} className='post-list-item flex gap-3 p-3 border rounded-md bg-white shadow-sm items-start'>
            <Link href={`/post/${post.slug}`} className='w-28 h-20 flex-shrink-0 overflow-hidden rounded-md'>
              <img src={post.image} alt={post.title} className='w-full h-full object-cover' />
            </Link>
            <div className='flex-1'>
              <Link href={`/post/${post.slug}`} className='text-sm font-semibold hover:underline block'>
                {post.title}
              </Link>
              <div className='text-xs text-gray-500 mt-1 line-clamp-2' dangerouslySetInnerHTML={{ __html: (post.content || '').slice(0, 150) }} />
              <div className='mt-2 text-xs text-gray-400'>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span className='mx-2'>•</span>
                <span className='text-teal-500'>{post.category || 'uncategorized'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}