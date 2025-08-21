'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10) || 1;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const perPage = 10; // số bài / trang

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/post/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 100, order: 'desc' }),
        });
        const data = await res.json();
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      } catch (err) {
        console.error('Error getting post:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // keep selectedCategory/currentPage in sync when URL params change
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const pageParam = parseInt(searchParams.get('page') || '1', 10) || 1;
    setSelectedCategory(cat);
    setCurrentPage(pageParam);
  }, [searchParams]);

  // categories map and list
  const categoriesMap = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      const c = (p.category || 'Chưa được phân loại').toString();
      map[c] = (map[c] || 0) + 1;
    });
    return map;
  }, [posts]);
  const categories = useMemo(() => Object.keys(categoriesMap), [categoriesMap]);

  // total posts count for "Tất cả"
  const totalPosts = posts.length;

  // filtered posts by selectedCategory
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts;
    return posts.filter((p) => (p.category || 'Chưa được phân loại') === selectedCategory);
  }, [posts, selectedCategory]);

  // pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / perPage));
  const normalizedPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (normalizedPage - 1) * perPage;
  const pagePosts = filteredPosts.slice(startIndex, startIndex + perPage);

  const updateUrlParams = (cat, page) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (page && page > 1) params.set('page', String(page));
    const qs = params.toString();
    const newUrl = qs ? `/?${qs}` : '/';
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newUrl);
    }
  };

  const onCategoryClick = (cat) => {
    const next = cat === selectedCategory ? '' : cat;
    setSelectedCategory(next);
    // reset to page 1 when changing category
    setCurrentPage(1);
    updateUrlParams(next, 1);
  };

  const goToPage = (page) => {
    const next = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(next);
    updateUrlParams(selectedCategory, next);
  };

  return (
    <>
      {/* Hero banner */}
      <section className="hero-banner">
        <div className="hero-inner wrapper">
          <h1 className="hero-title">Chào mừng bạn đến với Blog của chúng tôi</h1>
          <p className="hero-sub">
            Bắt đầu blog của bạn hôm nay và tham gia vào cộng đồng những người viết và độc giả đam mê chia sẻ câu chuyện và ý tưởng của họ.
          </p>
        </div>
      </section>

      {/* Main content (wrapper) */}
      <div className="wrapper container">
        {/* Bài viết gần đây header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Bài viết gần đây</h2>
        </div>

        {/* Mobile categories bar: horizontal chips (only shown on small screens) */}
        <div className="mobile-cats mb-4 md:hidden">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            <button
              className={`cat-chip ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => onCategoryClick('')}
            >
              Tất cả <span className="ml-2 text-xs text-gray-400">{totalPosts}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => onCategoryClick(cat)}
              >
                {cat} <span className="ml-2 text-xs text-gray-400">{categoriesMap[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className='layout-grid grid gap-6 lg:grid-cols-[1fr_280px]'>
          {/* LEFT: vertical list of posts */}
          <div className='posts-column'>
            {loading ? (
              <div className='text-center text-gray-500 py-10'>Loading...</div>
            ) : pagePosts && pagePosts.length > 0 ? (
              <div className='post-list flex flex-col gap-4'>
                {pagePosts.map((post) => (
                  <article
                    key={post.id || post._id || post.slug}
                    className='post-list-item flex gap-4 p-4 border rounded-md bg-white shadow-sm'
                  >
                    <Link
                      href={`/post/${post.slug}`}
                      className='w-28 h-20 flex-shrink-0 overflow-hidden rounded-md'
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className='w-full h-full object-cover'
                      />
                    </Link>
                    <div className='flex-1'>
                      <Link
                        href={`/post/${post.slug}`}
                        className='text-lg font-semibold hover:underline'
                      >
                        {post.title}
                      </Link>
                      <div
                        className='text-sm text-gray-500 mt-1 line-clamp-3'
                        dangerouslySetInnerHTML={{
                          __html: (post.content || '').slice(0, 250),
                        }}
                      />
                      <div className='mt-2 flex items-center justify-between text-xs text-gray-400'>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => onCategoryClick(post.category || 'Chưa được phân loại')}
                          className='text-teal-500 hover:underline'
                        >
                          {post.category || 'Chưa được phân loại'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className='flex items-center justify-center gap-3 mt-6'>
                    <button
                      onClick={() => goToPage(normalizedPage - 1)}
                      disabled={normalizedPage <= 1}
                      className='px-3 py-1 rounded border bg-white disabled:opacity-50'
                    >
                      ← Trước
                    </button>
                    <span className='text-sm text-gray-600'>Trang {normalizedPage} / {totalPages}</span>
                    <button
                      onClick={() => goToPage(normalizedPage + 1)}
                      disabled={normalizedPage >= totalPages}
                      className='px-3 py-1 rounded border bg-white disabled:opacity-50'
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className='text-center text-gray-500 py-10'>Không có bài viết nào.</div>
            )}
          </div>

          {/* RIGHT: categories sidebar */}
          <aside className='sidebar-column'>
            <div className='sticky top-24 p-4 bg-white rounded-md shadow-sm'>
              <h3 className='text-lg font-semibold mb-3'>Chuyên mục 🗂️</h3>
              {categories.length > 0 ? (
                <ul className='category-list flex flex-col gap-2'>
                  <li
                    key={'__all__'}
                    className={`category-item flex items-center justify-between px-2 py-2 rounded hover:bg-slate-50 ${selectedCategory === '' ? 'bg-slate-100 font-semibold' : ''}`}
                  >
                    <button
                      onClick={() => onCategoryClick('')}
                      className='text-sm text-gray-700 hover:underline text-left w-full'
                    >
                      Tất cả
                    </button>
                    <span className='text-xs text-gray-400'>{totalPosts}</span>
                  </li>
                  {categories.map((cat) => (
                    <li
                      key={cat}
                      className={`category-item flex items-center justify-between px-2 py-2 rounded hover:bg-slate-50 ${selectedCategory === cat ? 'bg-slate-100 font-semibold' : ''}`}
                    >
                      <button
                        onClick={() => onCategoryClick(cat)}
                        className='text-sm text-gray-700 hover:underline text-left w-full'
                      >
                        {cat}
                      </button>
                      <span className='text-xs text-gray-400'>{categoriesMap[cat]}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className='text-sm text-gray-400'>Chưa có chuyên mục</div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
