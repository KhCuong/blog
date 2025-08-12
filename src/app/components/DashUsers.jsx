'use client';

import { Table } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
export default function DashUsers() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.isAdmin) {
        const fetchUsers = async () => {
          try {
            const res = await fetch('/api/user/get', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userMongoId: parsedUser.userMongoId,
              }),
            });
            const data = await res.json();
            if (res.ok) {
              setUsers(data.users);
            }
          } catch (error) {
            console.log(error.message);
          }
        };
        fetchUsers();
      }
    }
  }, []);

  if (!user?.isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center h-full w-full py-7'>
        <h1 className='text-2xl font-semibold'>You are not an admin!</h1>
      </div>
    );
  }
  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {user?.isAdmin && users.length > 0 ? (
        <Table hoverable className='shadow-md'>
          <Table.Head>
            <Table.HeadCell>Date created</Table.HeadCell>
            <Table.HeadCell>User image</Table.HeadCell>
            <Table.HeadCell>Username</Table.HeadCell>
            <Table.HeadCell>Email</Table.HeadCell>
            <Table.HeadCell>Admin</Table.HeadCell>
          </Table.Head>
          <Table.Body className='divide-y'>
            {users.map((u) => (
              <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800' key={u._id}>
                <Table.Cell>
                  {new Date(u.createdAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <img
                    src={u.profilePicture}
                    alt={u.username}
                    className='w-10 h-10 object-cover bg-gray-500 rounded-full'
                  />
                </Table.Cell>
                <Table.Cell>{u.username}</Table.Cell>
                <Table.Cell>{u.email}</Table.Cell>
                <Table.Cell>
                  {u.isAdmin ? (
                    <FaCheck className='text-green-500' />
                  ) : (
                    <FaTimes className='text-red-500' />
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <p>You have no users yet!</p>
      )}
    </div>
  );
}