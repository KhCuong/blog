
import fs from 'fs';
import path from 'path';


export const PUT = async (req) => {
  try {
    const data = await req.json();
    // Xác thực admin từ request body
    if (!data.isAdmin || !data.userId) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
    // Đọc và cập nhật post trong file posts.json (giả lập localStorage server-side)
    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }
    let updatedPost = null;
    posts = posts.map(post => {
      if (post.id === data.postId) {
        updatedPost = {
          ...post,
          title: data.title,
          content: data.content,
          category: data.category,
          image: data.image,
          updatedAt: new Date().toISOString(),
        };
        return updatedPost;
      }
      return post;
    });
    if (!updatedPost) {
      return new Response('Post not found', { status: 404 });
    }
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), 'utf-8');
    return new Response(JSON.stringify(updatedPost), {
      status: 200,
    });
  } catch (error) {
    console.log('Error updating post:', error);
    return new Response('Error updating post', {
      status: 500,
    });
  }
};
