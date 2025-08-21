import fs from 'fs';
import path from 'path';


export const PUT = async (req) => {
  try {
    const data = await req.json();
    // accept flexible user id fields from client
    const uid = data && (data.userId || data.userMongoId || data.user?.userId || data.user?.id || data.user?._id);
    if (!data || !uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized - missing userId' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Đọc và cập nhật post trong file posts.json (giả lập localStorage server-side)
    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }
    let updatedPost = null;
    // find by id/_id/slug
    const pid = data.postId;
    const idx = posts.findIndex(post =>
      (post.id && String(post.id) === String(pid)) ||
      (post._id && String(post._id) === String(pid)) ||
      (post.slug && String(post.slug) === String(pid))
    );
    if (idx === -1) {
      return new Response(JSON.stringify({ message: 'Post not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    const existing = posts[idx];
    const requesterIsOwner = existing.userId && String(existing.userId) === String(uid);
    if (!data.isAdmin && !requesterIsOwner) {
      return new Response(JSON.stringify({ message: 'Unauthorized - not owner' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
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
    return new Response(JSON.stringify({ message: 'Post updated', post: updatedPost, posts }), {
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
