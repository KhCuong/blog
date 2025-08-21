'use client';
import { Button, Modal, Table, Alert } from 'flowbite-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function DashPosts() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');
  const [postTitleToDelete, setPostTitleToDelete] = useState('');
  const [actionError, setActionError] = useState(null);

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
    if (!user) return;
    if (!postIdToDelete) return;
    try {
      const uid = user.userId || user.id || user._id || user.userMongoId || null;
      if (!uid) {
        setActionError('Missing user info');
        return;
      }
      const res = await fetch('/api/post/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postIdToDelete,
          userId: uid,
          isAdmin: user.isAdmin,
        }),
      });

      // parse response safely (try JSON, fallback to text)
      let data = null;
      let textBody = null;
      try {
        data = await res.clone().json();
      } catch (e) {
        try { textBody = await res.clone().text(); } catch (e2) { /* ignore */ }
      }
      if (!res.ok) {
        const msg = (data && (data.message || data.error)) || textBody || `HTTP ${res.status} ${res.statusText}`;
        console.error('Delete failed:', { status: res.status, message: msg, body: data || textBody });
        setActionError(msg);
        setTimeout(() => setActionError(null), 4000);
        return;
      }
      const okData = data || (await res.json().catch(() => null));
      const removedId = postIdToDelete;
      setPostIdToDelete('');
      setPostTitleToDelete('');
      if (okData && Array.isArray(okData.posts)) {
        setUserPosts(okData.posts);
      } else {
        setUserPosts(prev => prev.filter(p => {
          const key = p.id || p._id || p.slug;
          return String(key) !== String(removedId);
        }));
      }
      setActionError(null);
      window.dispatchEvent(new Event('postsChanged'));
    } catch (error) {
      console.error('Delete exception:', error);
      setActionError(error?.message || 'Delete failed');
      setTimeout(() => setActionError(null), 4000);
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
      {actionError && <Alert color='failure' className='mb-4'>{actionError}</Alert>}
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
                <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800' key={post.id || post._id || post.slug}>
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
                        const key = post.id || post._id || post.slug;
                        setShowModal(true);
                        setPostIdToDelete(key);
                        setPostTitleToDelete(post.title || '');
                      }}
                    >
                      Xóa
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className='text-teal-500 hover:underline'
                      href={`/dashboard/update-post/${post.id || post._id || post.slug}`}
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
            <h3 className='mb-2 text-lg text-gray-500 dark:text-gray-400'>
              Bạn có chắc chắn muốn xóa bài viết này không?
            </h3>
            {postTitleToDelete && <div className='mb-4 font-semibold'>{postTitleToDelete}</div>}
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