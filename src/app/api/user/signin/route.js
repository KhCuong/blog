import fs from 'fs/promises';
import path from 'path';

const usersFile = path.resolve(process.cwd(), 'src/lib/users.json');

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
        return new Response(JSON.stringify({ message: 'Sign in successful!', user }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Sign in failed' }), { status: 500 });
    }
}
