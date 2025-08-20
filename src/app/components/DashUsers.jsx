'use client';

import { Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function DashUsers() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.isAdmin) {
        const fetchUsers = async () => {
          try {
            // <-- CALL CORRECT ENDPOINT: /api/admin/user (route.js is at src/app/api/admin/user/route.js)
            const res = await fetch('/api/admin/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userMongoId: parsedUser.userMongoId,
                isAdmin: parsedUser.isAdmin,
              }),
            });

            if (!res.ok) {
              const text = await res.text().catch(() => null);
              setErrorMsg(`Server error: ${res.status}${text ? ' — ' + text : ''}`);
              setUsers([]);
              return;
            }

            const data = await res.json();
            setUsers(Array.isArray(data.users) ? data.users : []);
          } catch (error) {
            console.log(error.message);
            setErrorMsg(error.message);
            setUsers([]);
          } finally {
            setLoading(false);
          }
        };
        fetchUsers();
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // New: delete handler
  const handleDelete = async (targetId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIdToDelete: targetId,
          userMongoId: user?.userMongoId,
          isAdmin: user?.isAdmin,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || `Server error: ${res.status}`);
      }
      const data = await res.json();
      // If API returns updated users, use it; otherwise remove locally
      if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers(prev => prev.filter(u => (u._id || u.id || u.email) !== targetId));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full py-7">
        <h1 className="text-xl font-semibold">Loading users...</h1>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center h-full w-full py-7'>
        <h1 className='text-2xl font-semibold'>You are not an admin!</h1>
      </div>
    );
  }

  return (
    <div className='w-full max-w-5xl mx-auto p-3'>
      <h1 className="text-2xl font-bold mb-6 text-center">Quản lý người dùng</h1>

      {errorMsg && (
        <div className="text-red-600 text-center mb-4">{errorMsg}</div>
      )}

      {users.length > 0 ? (
        <div className="overflow-x-auto rounded-lg shadow">
          <Table hoverable className='min-w-[600px]'>
            <Table.Head>
              <Table.HeadCell>Ngày tạo</Table.HeadCell>
              <Table.HeadCell>Ảnh đại diện</Table.HeadCell>
              <Table.HeadCell>Tên người dùng</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Quản trị viên</Table.HeadCell>
              <Table.HeadCell>Hành động</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {users.map((u) => {
                const keyId = u._id || u.id || u.email;
                return (
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800' key={keyId}>
                    <Table.Cell>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <img
                        src={u.profilePicture || '/placeholder-avatar.png'}
                        alt={u.username || u.email}
                        className='w-10 h-10 object-cover bg-gray-500 rounded-full'
                      />
                    </Table.Cell>
                    <Table.Cell>{u.username || '-'}</Table.Cell>
                    <Table.Cell>{u.email || '-'}</Table.Cell>
                    <Table.Cell>
                      {u.isAdmin ? (
                        <FaCheck className='text-green-500' />
                      ) : (
                        <FaTimes className='text-red-500' />
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => handleDelete(keyId)}
                        className="text-sm text-red-600 hover:underline"
                        disabled={user?.userMongoId && (user.userMongoId === (u._id || u.id || u.email))}
                        title={user?.userMongoId && (user.userMongoId === (u._id || u.id || u.email)) ? "Không thể xóa chính bạn" : "Xóa người dùng"}
                      >
                        Xóa
                      </button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      ) : (
        <div>
          <p className="text-center text-gray-500 mt-8">Bạn chưa có người dùng nào!</p>
        </div>
      )}
    </div>
  );

}