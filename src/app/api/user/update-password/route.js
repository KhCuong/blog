import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { username, password, ...rest } = await req.json();
    if (!username) {
      return new Response(JSON.stringify({ error: 'Thiếu username.' }), { status: 400 });
    }
    const usersPath = path.join(process.cwd(), 'src', 'data', 'users.json');
    let users = [];
    try {
      const file = await fs.readFile(usersPath, 'utf-8');
      users = JSON.parse(file);
    } catch {
      return new Response(JSON.stringify({ error: 'Không tìm thấy users.json.' }), { status: 500 });
    }
    const idx = users.findIndex(u => u.username === username);
    if (idx === -1) {
      return new Response(JSON.stringify({ error: 'Không tìm thấy user.' }), { status: 404 });
    }
    if (password) users[idx].password = password;
    Object.assign(users[idx], rest);
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2), 'utf-8');
    return new Response(JSON.stringify({ success: true, user: users[idx] }), { status: 200 });
  } catch (e) {
    console.error('API /api/user/update-password error:', e);
    return new Response(JSON.stringify({ error: 'Lỗi hệ thống.' }), { status: 500 });
  }
}
