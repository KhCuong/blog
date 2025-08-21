export default function About() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-2xl mx-auto p-3 text-center'>
        <div>
          <h1 className='text-3xl font font-semibold text-center my-7'>
            Blog
          </h1>
          <div className='text-md text-gray-500 flex flex-col gap-6'>
            <p>
              Đây là một blog được xây dựng trên nền tảng Next.js,
              tích hợp đầy đủ các chức năng cơ bản như đăng,
              chỉnh sửa và xóa bài viết.
              Blog không chỉ đơn thuần là nơi đăng tải nội dung,
              mà còn là một không gian mở để mọi người cùng chia sẻ kiến thức,
              kinh nghiệm và những góc nhìn cá nhân.
            </p>

            <p>
              Mục tiêu của blog là tạo ra một môi trường học tập và trao đổi thân thiện,
              nơi người đọc có thể dễ dàng tìm kiếm thông tin,
              học hỏi từ trải nghiệm thực tế,
              và thậm chí đóng góp thêm những bài viết của riêng mình.
              Với giao diện trực quan và tính năng quản lý bài viết tiện lợi,
              blog hướng đến việc mang lại trải nghiệm sử dụng mượt mà cho cả người viết lẫn người đọc.
            </p>

            <p>
              Hy vọng qua blog này, bạn sẽ tìm thấy những bài viết hữu ích,
              những kiến thức giá trị và cảm hứng để cùng nhau học hỏi,
              phát triển kỹ năng cũng như kết nối cộng đồng yêu thích chia sẻ và khám phá tri thức.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}