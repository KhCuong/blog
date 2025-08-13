"use client"

import { useEffect, useState } from 'react';



export default function DashProfile() {
  const [user, setUser] = useState(null);

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");

  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    updateUser();
    window.addEventListener('userChanged', updateUser);
    return () => {
      window.removeEventListener('userChanged', updateUser);
    };
  }, []);

  if (!user) {
    return <div className='text-center mt-10'>Bạn chưa đăng nhập.</div>;
  }


  const handleChangePassword = async () => {
    setPwdMsg("");
    if (!oldPwd || !newPwd || !confirmPwd) {
      setPwdMsg("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg("Mật khẩu mới không khớp.");
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser.password !== oldPwd) {
      setPwdMsg("Mật khẩu cũ không đúng.");
      return;
    }
    // Update password in users.json via API
    try {
      const updateRes = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: storedUser.username, password: newPwd })
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok || updateData.error) {
        setPwdMsg(updateData.error || 'Lỗi khi cập nhật mật khẩu.');
        return;
      }
    } catch (e) {
      setPwdMsg('Lỗi hệ thống.');
      return;
    }
    storedUser.password = newPwd;
    localStorage.setItem('user', JSON.stringify(storedUser));
    setPwdMsg("Đổi mật khẩu thành công!");
    setOldPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setShowPwdModal(false), 1200);
    window.dispatchEvent(new Event('userChanged'));
  };

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-md mt-10 mx-auto max-w-4xl min-h-[400px]">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-r border-gray-200 bg-gray-50 rounded-l-lg p-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold mb-6">Account</h2>
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 text-gray-900 font-semibold focus:outline-none">
            <span className="inline-block w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" /></svg>
            </span>
            Profile
          </button>
          {/* Security tab omitted */}
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 p-8">
        <h3 className="text-xl font-bold mb-6">Profile details</h3>
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-4xl text-white font-bold">
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="font-semibold text-lg">{user.username}</div>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <div className="font-semibold">Full name</div>
              <div className="text-gray-700">{user.username}</div>
            </div>
            <div>
              <div className="font-semibold">Email addresses</div>
              <div className="flex items-center gap-2">
                <span>{user.email}</span>
                <span className="bg-gray-200 text-xs px-2 py-0.5 rounded">Primary</span>
              </div>
              {/* Add email address (not implemented) */}
            </div>

            <div>
              <button className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-semibold border border-gray-300" onClick={() => setShowPwdModal(true)}>
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
        {/* Password change modal */}
        {showPwdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowPwdModal(false)}>&times;</button>
              <h4 className="text-lg font-bold mb-4">Đổi mật khẩu</h4>
              <div className="mb-2">
                <input type="password" className="w-full border rounded px-3 py-2" placeholder="Mật khẩu cũ" value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
              </div>
              <div className="mb-2">
                <input type="password" className="w-full border rounded px-3 py-2" placeholder="Mật khẩu mới" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              </div>
              <div className="mb-2">
                <input type="password" className="w-full border rounded px-3 py-2" placeholder="Nhập lại mật khẩu mới" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
              </div>
              {pwdMsg && <div className={`mb-2 text-sm ${pwdMsg.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>{pwdMsg}</div>}
              <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded mt-2" onClick={handleChangePassword}>Xác nhận</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
