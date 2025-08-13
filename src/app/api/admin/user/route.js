
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
    const usersFile = path.join(process.cwd(), 'users.json');
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