'use client';
import { Button, Modal, Table } from 'flowbite-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');

  // Lưu user vào ref để luôn lấy đúng khi fetch lại
  const userRef = useRef(null);

  // Hàm fetchPosts: admin lấy toàn bộ post, user thường chỉ lấy post của mình
  const fetchPosts = useCallback(async (user) => {
    if (!user) return;
    try {
      const body = user.isAdmin
        ? { limit: 1000 }
        : { userId: user.userId };
      const res = await fetch('/api/post/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setUserPosts(data.posts);
      }
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      userRef.current = parsedUser;
      fetchPosts(parsedUser);
    }
  }, [fetchPosts]);

  useEffect(() => {
    // Lắng nghe event postsChanged để tự động fetch lại posts
    const handlePostsChanged = () => {
      if (userRef.current) {
        fetchPosts(userRef.current);
      }
    };
    window.addEventListener('postsChanged', handlePostsChanged);
    return () => {
      window.removeEventListener('postsChanged', handlePostsChanged);
    };
  }, [fetchPosts]);

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const res = await fetch('/api/post/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postIdToDelete,
          userId: user.userId,
          isAdmin: user.isAdmin,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const removedId = postIdToDelete;
        setPostIdToDelete('');

        // Nếu API trả về posts đã cập nhật thì dùng luôn, ngược lại filter local
        if (Array.isArray(data.posts)) {
          setUserPosts(data.posts);
        } else {
          setUserPosts(prev => prev.filter(p => p.id !== removedId));
        }

        // Phát event để các component khác có thể lắng nghe và cập nhật (nếu cần)
        window.dispatchEvent(new Event('postsChanged'));
      } else {
        console.log(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center h-full w-full py-7'>
        <h1 className='text-2xl font-semibold'>You are not logged in!</h1>
      </div>
    );
  }

  return (
    <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {userPosts.length > 0 ? (
        <>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Ngày cập nhật</Table.HeadCell>
              <Table.HeadCell>Ảnh bài viết</Table.HeadCell>
              <Table.HeadCell>Tiêu đề bài viết</Table.HeadCell>
              <Table.HeadCell>Chuyên Mục</Table.HeadCell>
              <Table.HeadCell>Xóa</Table.HeadCell>
              <Table.HeadCell>
                <span>Chỉnh sửa</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {userPosts.map((post) => (
                <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800' key={post.id}>
                  <Table.Cell>
                    {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Link href={`/post/${post.slug}`}>
                      <img
                        src={post.image}
                        alt={post.title}
                        className='w-20 h-10 object-cover bg-gray-500'
                      />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className='font-medium text-gray-900 dark:text-white'
                      href={`/post/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{post.category}</Table.Cell>
                  <Table.Cell>
                    <span
                      className='font-medium text-red-500 hover:underline cursor-pointer'
                      onClick={() => {
                        setShowModal(true);
                        setPostIdToDelete(post.id);
                      }}
                    >
                      Xóa
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className='text-teal-500 hover:underline'
                      href={`/dashboard/update-post/${post.id}`}
                    >
                      <span>Chỉnh sửa</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      ) : (
        <p>Bạn chưa có bài viết nào!</p>
      )
      }
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Bạn có chắc chắn muốn xóa bài viết này không?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeletePost}>
                Có
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                Không
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div >
  );
}