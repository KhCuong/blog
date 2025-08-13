
import fs from 'fs';
import path from 'path';

export const POST = async (req) => {
  const data = await req.json();
  try {
    const startIndex = parseInt(data.startIndex) || 0;
    const limit = parseInt(data.limit) || 9;
    const sortDirection = data.order === 'asc' ? 1 : -1;
    // Đọc dữ liệu từ file posts.json (giả lập localStorage server-side)
    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }
    // Lọc dữ liệu theo các trường
    if (data.userId) posts = posts.filter(p => p.userId === data.userId);
    if (data.category && data.category !== 'null' && data.category !== 'undefined') posts = posts.filter(p => p.category === data.category);
    if (data.slug) posts = posts.filter(p => p.slug === data.slug);
    if (data.postId) posts = posts.filter(p => p.id === data.postId);
    if (data.searchTerm) {
      const term = data.searchTerm.toLowerCase();
      posts = posts.filter(p =>
        (p.title && p.title.toLowerCase().includes(term)) ||
        (p.content && p.content.toLowerCase().includes(term))
      );
    }
    // Sắp xếp theo createdAt (không có updatedAt)
    posts = posts.sort((a, b) => {
      if (sortDirection === 1) return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const totalPosts = posts.length;
    // Lấy số lượng post trong 1 tháng gần nhất
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthPosts = posts.filter(p => new Date(p.createdAt) >= oneMonthAgo).length;
    // Phân trang
    const pagedPosts = posts.slice(startIndex, startIndex + limit);
    return new Response(JSON.stringify({ posts: pagedPosts, totalPosts, lastMonthPosts }), {
      status: 200,
    });
  } catch (error) {
    console.log('Error getting posts:', error);
    return new Response('Error getting posts', { status: 500 });
  }
};