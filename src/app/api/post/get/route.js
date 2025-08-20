import fs from 'fs';
import path from 'path';

export const POST = async (req) => {
  // safe parse body
  const data = (await req.json()) || {};
  try {
    const startIndex = parseInt(data.startIndex) || 0;
    const limit = parseInt(data.limit) || 9;
    const order = (data.order || data.sort || 'desc').toString().toLowerCase();
    const sortDirection = order === 'asc' ? 1 : -1;

    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }

    // helper: safe timestamp (fallback 0)
    const safeTs = (d) => {
      const t = Date.parse(d);
      return Number.isNaN(t) ? 0 : t;
    };

    // helper: strip html for search
    const stripHtml = (s) => (s ? String(s).replace(/<[^>]+>/g, '') : '');

    // filters
    if (data.userId) posts = posts.filter(p => p.userId === data.userId);
    if (data.category && data.category !== 'null' && data.category !== 'undefined') posts = posts.filter(p => p.category === data.category);
    if (data.slug) posts = posts.filter(p => p.slug === data.slug);
    if (data.postId) posts = posts.filter(p => p.id === data.postId);
    if (data.searchTerm) {
      const term = String(data.searchTerm).toLowerCase();
      posts = posts.filter(p =>
        (p.title && p.title.toLowerCase().includes(term)) ||
        (stripHtml(p.content).toLowerCase().includes(term))
      );
    }

    // sort safely by createdAt (fallback to 0)
    posts = posts.sort((a, b) => {
      const ta = safeTs(a.createdAt);
      const tb = safeTs(b.createdAt);
      return sortDirection === 1 ? ta - tb : tb - ta;
    });

    const totalPosts = posts.length;

    // one month ago (robust)
    const now = new Date();
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    const lastMonthPosts = posts.filter(p => safeTs(p.createdAt) >= oneMonthAgo.getTime()).length;

    // pagination
    const pagedPosts = posts.slice(startIndex, startIndex + limit);

    return new Response(JSON.stringify({ posts: pagedPosts, totalPosts, lastMonthPosts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log('Error getting posts:', error);
    return new Response(JSON.stringify({ message: 'Error getting posts' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};