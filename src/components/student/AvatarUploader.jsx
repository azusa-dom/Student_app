import React, { useState, useEffect } from 'react';
import { User, Camera, Upload, Check } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const AvatarUploader = ({ currentAvatar, onAvatarChange }) => {
  const { getInitials } = useUser();
  const [preview, setPreview] = useState(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // 当currentAvatar属性改变时，更新preview状态
  useEffect(() => {
    setPreview(currentAvatar || null);
  }, [currentAvatar]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 检查文件大小（限制为2MB）
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过2MB');
        return;
      }

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        if (onAvatarChange) {
          onAvatarChange(reader.result);
        }
        setUploading(false);
        setUploadSuccess(true);
        
        // 3秒后隐藏成功提示
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* 头像显示 */}
      <div className="relative">
        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
          {preview ? (
            <img src={preview} alt="用户头像" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-semibold text-xl">{getInitials()}</span>
            </div>
          )}
        </div>
        
        {/* 上传状态指示器 */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* 上传控件 */}
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-1">头像</h3>
        <p className="text-sm text-gray-500 mb-3">
          点击下方按钮更换头像，支持JPG、PNG格式，大小不超过2MB
        </p>
        
        <div className="flex items-center space-x-3">
          <label className="relative cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
              disabled={uploading}
            />
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">上传中...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">更换头像</span>
                </>
              )}
            </div>
          </label>

          {uploadSuccess && (
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="text-sm">上传成功</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarUploader;