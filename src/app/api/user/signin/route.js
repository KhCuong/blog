
import fs from 'fs/promises';
import path from 'path';
import { setSession } from '../../sessionStore';

const usersFile = path.resolve(process.cwd(), 'src/data/users.json');

export async function POST(req) {
    try {
        const { email, password } = await req.json();
        let users = [];
        try {
            const fileData = await fs.readFile(usersFile, 'utf-8');
            users = JSON.parse(fileData);
        } catch (err) {
            users = [];
        }
        // Kiểm tra user
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
        }
        // Đảm bảo trả về user có userId và sessionId
        const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const userWithUserId = { ...user, userId: user.id };
        setSession(sessionId, userWithUserId);
        // Gửi sessionId về client qua cookie
        const res = new Response(JSON.stringify({ message: 'Sign in successful!', user: userWithUserId }), { status: 200 });
        res.headers.set('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax`);
        return res;
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Sign in failed' }), { status: 500 });
    }
}
