import fs from 'fs';
import path from 'path';

export const DELETE = async (req) => {
  try {
    const data = await req?.json();
    // Yêu cầu userId để xác thực (admin vẫn được phép)
    if (!data || !data.userId) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }

    const idx = posts.findIndex(post => post.id === data.postId);
    if (idx === -1) {
      return new Response(JSON.stringify({ message: 'Post not found' }), { status: 404 });
    }

    // Cho phép xóa nếu là admin hoặc là chủ post
    const post = posts[idx];
    if (!data.isAdmin && post.userId !== data.userId) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }

    posts.splice(idx, 1);
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), 'utf-8');

    return new Response(JSON.stringify({ message: 'Post deleted', posts }), { status: 200 });
  } catch (error) {
    console.log('Error deleting post:', error);
    return new Response(JSON.stringify({ message: 'Error deleting post' }), { status: 500 });
  }
};