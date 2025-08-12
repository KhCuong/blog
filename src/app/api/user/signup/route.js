import fs from 'fs/promises';
import path from 'path';

const usersFile = path.resolve(process.cwd(), 'src/lib/users.json');

export async function POST(req) {
    try {
        const { username, email, password } = await req.json();
        let users = [];
        try {
            const fileData = await fs.readFile(usersFile, 'utf-8');
            users = JSON.parse(fileData);
        } catch (err) {
            users = [];
        }
        // Kiểm tra email đã tồn tại
        if (users.find(u => u.email === email)) {
            return new Response(JSON.stringify({ message: 'Email already exists' }), { status: 400 });
        }
        // Tạo user mới
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password,
            isAdmin: false,
            createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
        return new Response(JSON.stringify({ message: 'Sign up successful!' }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Sign up failed' }), { status: 500 });
    }
}
