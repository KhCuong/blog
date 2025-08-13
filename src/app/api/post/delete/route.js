
import fs from 'fs';
import path from 'path';

export const DELETE = async (req) => {
  try {
    const data = await req?.json();
    // Xác thực admin từ request body
    if (!data.isAdmin || !data.userId) {
      return new Response('Unauthorized', { status: 401 });
    }
    // Xóa post khỏi file posts.json (giả lập localStorage server-side)
    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }
    const beforeCount = posts.length;
    posts = posts.filter(post => post.id !== data.postId);
    if (posts.length === beforeCount) {
      return new Response('Post not found', { status: 404 });
    }
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), 'utf-8');
    return new Response('Post deleted', { status: 200 });
  } catch (error) {
    console.log('Error deleting post:', error);
    return new Response('Error deleting post', { status: 500 });
  }
};