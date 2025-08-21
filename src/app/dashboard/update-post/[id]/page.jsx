'use client';

// import { useUser } from '@clerk/nextjs';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
// https://dev.to/a7u/reactquill-with-nextjs-478b
import 'react-quill-new/dist/quill.snow.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
// Removed duplicate import of useEffect and useState

export default function UpdatePostPage() {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryCustom, setCategoryCustom] = useState('');
  const [title, setTitle] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const postId = pathname.split('/').pop();
  const isMounted = useRef(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // always fetch the post when postId changes (do not depend on user)
    let mounted = true;
    const fetchPost = async () => {
      try {
        const res = await fetch('/api/post/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        });
        const data = await res.json();
        if (!mounted) return;
        if (res.ok && Array.isArray(data.posts) && data.posts.length) {
          setFormData(data.posts[0]);
        } else {
          // if no post found, clear formData to avoid stale values
          setFormData({});
        }
      } catch (error) {
        console.log(error.message);
        if (mounted) setFormData({});
      }
    };
    fetchPost();
    return () => { mounted = false; };
  }, [postId]);

  useEffect(() => {
    // when formData loads, initialize category fields ONLY if user hasn't already filled them
    if (formData && Object.keys(formData).length) {
      // init title state only if user hasn't typed already
      if (title === '') setTitle(formData.title || '');
      if (!selectedCategory) setSelectedCategory(formData.category || '');
      // only set categoryCustom if it's still empty (so we don't overwrite user's edits)
      if (categoryCustom === '') setCategoryCustom(formData.category || '');
      // ensure title is present in formData (controlled input uses formData.title)
      if (!formData.title && formData.title !== '') {
        setFormData(prev => ({ ...prev, title: formData.title || '' }));
      }
    }
    // mark mounted to avoid accidental resets after initial load
    isMounted.current = true;
  }, [formData]);

  const handleUpdloadImage = async () => {
    try {
      if (!file) {
        setImageUploadError('Please select an image');
        return;
      }
      setImageUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        setFormData({ ...formData, image: base64data });
        localStorage.setItem('uploadedImage', base64data);
      };
      reader.onerror = () => {
        setImageUploadError('Image upload failed');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setImageUploadError('Image upload failed');
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalCategory = categoryCustom?.trim() || selectedCategory || formData.category;
      const finalTitle = (title && title.trim()) || formData.title;
      const uid = user?.userId || user?.id || user?._id || user?.userMongoId || null;
      const res = await fetch('/api/post/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          title: finalTitle,
          category: finalCategory,
          userId: uid,
          isAdmin: user?.isAdmin,
          postId: postId,
        }),
      });
      const parsed = await res.json().catch(() => null);
      if (!res.ok) {
        setPublishError((parsed && (parsed.message || parsed.error)) || `HTTP ${res.status}`);
        return;
      }
      const updated = parsed && (parsed.post || parsed) || null;
      if (updated) {
        setFormData(prev => ({ ...prev, ...updated }));
        if (updated.title) setTitle(updated.title);
      }
      const slugTo = (parsed && (parsed.post?.slug || parsed.slug)) || updated?.slug;
      if (slugTo) {
        setPublishError('Cập nhật thành công! Đang chuyển trang...');
        window.dispatchEvent(new Event('postsChanged'));
        setTimeout(() => {
          setPublishError(null);
          router.push(`/post/${slugTo}`);
        }, 800);
      } else {
        setPublishError('Cập nhật thành công!');
      }
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  if (!isLoaded) {
    return null;
  }

  if (user) {
    return (
      <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        <h1 className='text-center text-3xl my-7 font-semibold'>
          Cập nhật bài viết
        </h1>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4 sm:flex-row justify-between'>
            <TextInput
              type='text'
              placeholder='Tiêu đề'
              required
              id='title'
              value={title}
              className='flex-1'
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className='flex-1'>
              <TextInput
                placeholder='Chuyên mục'
                value={categoryCustom}
                onChange={(e) => setCategoryCustom(e.target.value)}
              />
            </div>
          </div>
          <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
            <FileInput
              type='file'
              accept='image/*'
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button
              type='button'
              gradientDuoTone='purpleToBlue'
              size='sm'
              outline
              onClick={handleUpdloadImage}
              disabled={imageUploadProgress}
            >
              {imageUploadProgress ? (
                <div className='w-16 h-16'>
                  <CircularProgressbar
                    value={imageUploadProgress}
                    text={`${imageUploadProgress || 0}%`}
                  />
                </div>
              ) : (
                'Upload Image'
              )}
            </Button>
          </div>
          {imageUploadError && (
            <Alert color='failure'>{imageUploadError}</Alert>
          )}
          {formData.image && (
            <img
              src={formData.image}
              alt='upload'
              className='w-full h-72 object-cover'
            />
          )}
          <ReactQuill
            theme='snow'
            placeholder='Viết vào đây...'
            className='h-72 mb-12'
            required
            value={formData.content}
            onChange={(value) => {
              setFormData({ ...formData, content: value });
            }}
          />
          <Button type='submit' gradientDuoTone='purpleToPink'>
            Cập nhật
          </Button>
          {publishError && (
            <Alert className='mt-5' color='failure'>
              {publishError}
            </Alert>
          )}
        </form>
      </div>
    );
  }

  return (
    <h1 className='text-center text-3xl my-7 font-semibold min-h-screen'>
      Bạn cần phải đăng nhập để cập nhật một bài viết
    </h1>
  );
}

