import fs from 'fs';
import path from 'path';


export const PUT = async (req) => {
  try {
    const data = await req.json();
    // Yêu cầu userId để xác thực (admin vẫn được phép)
    if (!data || !data.userId) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }
    // Đọc và cập nhật post trong file posts.json (giả lập localStorage server-side)
    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }
    let updatedPost = null;
    const idx = posts.findIndex(post => post.id === data.postId);
    if (idx === -1) {
      return new Response(JSON.stringify({ message: 'Post not found' }), { status: 404 });
    }
    // Cho phép cập nhật nếu là admin hoặc là chủ post
    const existing = posts[idx];
    if (!data.isAdmin && existing.userId !== data.userId) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }
    updatedPost = {
      ...existing,
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      category: data.category ?? existing.category,
      image: data.image ?? existing.image,
      updatedAt: new Date().toISOString(),
    };
    posts[idx] = updatedPost;
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), 'utf-8');
    return new Response(JSON.stringify(updatedPost), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log('Error updating post:', error);
    return new Response(JSON.stringify({ message: 'Error updating post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
