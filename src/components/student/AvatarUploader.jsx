import React, { useState } from 'react';
import { User } from 'lucide-react';

const AvatarUploader = ({ currentAvatar, onAvatarChange }) => {
  const [preview, setPreview] = useState(currentAvatar);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        onAvatarChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-24 h-24 rounded-full overflow-hidden shadow-md">
        {preview ? (
          <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-500" />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm text-gray-600"
      />
    </div>
  );
};

export default AvatarUploader;