import fs from 'fs';
import path from 'path';

export const DELETE = async (req) => {
  try {
    const data = await req?.json();
    // accept flexible user id fields from client
    const uid = data && (data.userId || data.userMongoId || data.user?.userId || data.user?.id || data.user?._id);
    // Yêu cầu userId để xác thực (admin vẫn được phép)
    if (!data || !uid) {
      return new Response(JSON.stringify({ message: 'Unauthorized - missing userId' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (!data.postId) {
      return new Response(JSON.stringify({ message: 'Missing postId' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }

    // accept id / _id / slug lookup (loose string comparison)
    const pid = data.postId;
    const idx = posts.findIndex(post =>
      (post.id && String(post.id) === String(pid)) ||
      (post._id && String(post._id) === String(pid)) ||
      (post.slug && String(post.slug) === String(pid))
    );
    if (idx === -1) {
      return new Response(JSON.stringify({ message: 'Post not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    // Cho phép xóa nếu là admin hoặc là chủ post
    const post = posts[idx];
    // ownership check - compare strings and accept alternative id fields
    const requesterIsOwner = post.userId && String(post.userId) === String(uid);
    if (!data.isAdmin && !requesterIsOwner) {
      return new Response(JSON.stringify({ message: 'Unauthorized - not owner' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    posts.splice(idx, 1);
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), 'utf-8');

    return new Response(JSON.stringify({ message: 'Post deleted', posts }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.log('Error deleting post:', error);
    return new Response(JSON.stringify({ message: 'Error deleting post' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};