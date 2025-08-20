import fs from 'fs';
import path from 'path';

export const POST = async (req) => {
  try {
    const data = await req.json();
    // Xác thực admin từ request body
    if (!data.isAdmin) {
      return new Response('Unauthorized', { status: 401 });
    }
    const startIndex = parseInt(data.startIndex) || 0;
    const limit = parseInt(data.limit) || 9;
    const sortDirection = data.sort === 'asc' ? 1 : -1;
    // Đọc dữ liệu từ file users.json (giả lập localStorage server-side)
    const usersFile = path.join(process.cwd(), 'src/data/users.json');
    let users = [];
    if (fs.existsSync(usersFile)) {
      const fileData = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(fileData || '[]');
    }
    // Sắp xếp theo createdAt
    users = users.sort((a, b) => {
      if (sortDirection === 1) return new Date(a.createdAt) - new Date(b.createdAt);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    const totalUsers = users.length;
    // Lấy số lượng user trong 1 tháng gần nhất
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthUsers = users.filter(u => new Date(u.createdAt) >= oneMonthAgo).length;
    // Phân trang
    const pagedUsers = users.slice(startIndex, startIndex + limit);
    return new Response(JSON.stringify({ users: pagedUsers, totalUsers, lastMonthUsers }), {
      status: 200,
    });
  } catch (error) {
    console.log('Error getting the users :', error);
    return new Response('Error getting the users', { status: 500 });
  }
};

export const DELETE = async (req) => {
  try {
    const data = await req.json();
    if (!data.isAdmin) {
      return new Response('Unauthorized', { status: 401 });
    }
    const userIdToDelete = data.userIdToDelete;
    if (!userIdToDelete) {
      return new Response('Missing userIdToDelete', { status: 400 });
    }

    const requesterId = data.userMongoId;
    if (requesterId && (requesterId === userIdToDelete)) {
      return new Response('Cannot delete yourself', { status: 400 });
    }

    const usersFile = path.join(process.cwd(), 'src/data/users.json');
    let users = [];
    if (fs.existsSync(usersFile)) {
      const fileData = fs.readFileSync(usersFile, 'utf-8');
      users = JSON.parse(fileData || '[]');
    }

    const idx = users.findIndex(u => (u._id && u._id === userIdToDelete) || (u.id && u.id === userIdToDelete) || (u.email && u.email === userIdToDelete));
    if (idx === -1) {
      return new Response('User not found', { status: 404 });
    }

    users.splice(idx, 1);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');

    return new Response(JSON.stringify({ users }), { status: 200 });
  } catch (error) {
    console.log('Error deleting the user :', error);
    return new Response('Error deleting the user', { status: 500 });
  }
};