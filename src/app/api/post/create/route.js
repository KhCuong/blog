
import fs from 'fs';
import path from 'path';


export const POST = async (req) => {
  try {
    const data = await req?.json();
    if (!data) {
      return new Response('Bad Request', { status: 400 });
    }

    const slug = data.title
      .split(' ')
      .join('-')
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, '');
    // Đường dẫn file posts.json (giả lập localStorage server-side)
    const postsFile = path.join(process.cwd(), 'src/data/posts.json');
    let posts = [];
    if (fs.existsSync(postsFile)) {
      const fileData = fs.readFileSync(postsFile, 'utf-8');
      posts = JSON.parse(fileData || '[]');
    }
    const newPost = {
      id: Date.now().toString(),
      userId: data.userId,
      content: data.content,
      title: data.title,
      image: data.image,
      category: data.category,
      slug,
      createdAt: new Date().toISOString(),
    };
    posts.unshift(newPost);
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), 'utf-8');
    return new Response(JSON.stringify(newPost), {
      status: 200,
    });
  } catch (error) {
    console.log('Error creating post:', error);
    return new Response('Error creating post', {
      status: 500,
    });
  }
};
