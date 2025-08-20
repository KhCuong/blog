import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const usersFile = path.resolve(process.cwd(), 'src/data/users.json');

// Hàm hash mật khẩu bằng SHA256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

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
        // Hash mật khẩu nhập vào để so sánh
        const hashedPassword = hashPassword(password);
        // Kiểm tra user
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        if (!user) {
            return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
        }
        // Đảm bảo trả về user có userId
        const userWithUserId = { ...user, userId: user.id };
        return new Response(JSON.stringify({ message: 'Sign in successful!', user: userWithUserId }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Sign in failed' }), { status: 500 });
    }
}
