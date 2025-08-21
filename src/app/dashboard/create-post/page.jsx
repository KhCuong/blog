'use client';

// import { useUser } from '@clerk/nextjs';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
// https://dev.to/a7u/reactquill-with-nextjs-478b
import 'react-quill-new/dist/quill.snow.css';



import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function CreatePostPage() {
  // Upload image bằng localStorage (base64)
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
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('uncategorized');
  const [categoryCustom, setCategoryCustom] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoaded(true);
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalCategory = categoryCustom?.trim() || selectedCategory;
      const uid = user?.userId || user?.id || user?._id || user?.userMongoId || null;
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          category: finalCategory,
          userId: uid,
          isAdmin: user?.isAdmin,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      if (res.ok) {
        setPublishError(null);
        // Phát event để các component khác (vd. DashPosts) tự fetch lại
        window.dispatchEvent(new Event('postsChanged'));
        router.push(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  if (!isLoaded) {
    return null;
  }

  // Hiển thị form cho mọi user đã đăng nhập (không yêu cầu là admin)
  if (user) {
    return (
      <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        {/* <h1 className='text-center text-3xl my-7 font-semibold'>
          Tạo bài viết
        </h1> */}
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4 sm:flex-row justify-between'>
            <TextInput
              type='text'
              placeholder='Tiêu đề'
              required
              id='title'
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
            placeholder='Viết vào đây...'
            className='h-72 mb-12'
            required
            onChange={(value) => {
              setFormData({ ...formData, content: value });
            }}
          />
          <Button type='submit' gradientDuoTone='purpleToPink'>
            Đăng bài
          </Button>
        </form>
      </div>
    );
  } else {
    return (
      <h1 className='text-center text-3xl my-7 font-semibold'>
        Bạn cần đăng nhập để tạo bài viết
      </h1>
    );
  }
}
