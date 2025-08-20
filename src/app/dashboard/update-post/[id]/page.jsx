'use client';

// import { useUser } from '@clerk/nextjs';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
// https://dev.to/a7u/reactquill-with-nextjs-478b
import 'react-quill-new/dist/quill.snow.css';
import { useEffect, useState } from 'react';
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
  const router = useRouter();
  const pathname = usePathname();
  const postId = pathname.split('/').pop();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch('/api/post/get', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: postId,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setFormData(data.posts[0]);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    // Cho phép mọi user đã login fetch post; API update sẽ kiểm tra quyền thực sự khi submit
    if (user) {
      fetchPost();
    }
  }, [postId, user]);

  useEffect(() => {
    // when formData loads, initialize category fields
    if (formData?.category) {
      setSelectedCategory(formData.category);
      setCategoryCustom(''); // default no custom
    }
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
      const res = await fetch('/api/post/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: finalCategory,
          userId: user?.userId,
          isAdmin: user?.isAdmin,
          postId: postId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      if (res.ok && data.slug) {
        setPublishError('Cập nhật thành công! Đang chuyển trang...');
        // Phát event để DashPosts cập nhật ngay
        window.dispatchEvent(new Event('postsChanged'));
        setTimeout(() => {
          setPublishError(null);
          router.push(`/post/${data.slug}`);
        }, 1000);
      } else {
        setPublishError('Cập nhật thành công nhưng không lấy được đường dẫn bài viết!');
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
              placeholder='Title'
              required
              id='title'
              defaultValue={formData.title}
              className='flex-1'
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
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
            placeholder='Write something...'
            className='h-72 mb-12'
            required
            value={formData.content}
            onChange={(value) => {
              setFormData({ ...formData, content: value });
            }}
          />
          <Button type='submit' gradientDuoTone='purpleToPink'>
            Update
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
