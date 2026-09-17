import React, { useState } from 'react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function NGORegister() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return setError('Please select at least one document.');
    
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('docs', f));
      
      await api.post('/requirements/vetting-docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Since context user doesn't update automatically from this single endpoint (normally does during auth),
      // we can simulate a reload or redirect.
      window.location.href = '/ngo/dashboard';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-2">Upload Vetting Documents</h2>
      <p className="text-gray-400 mb-6 flex-wrap">
        Please provide registration certificates, tax exemptions, or any ID docs to verify your NGO.
      </p>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Documents (PDF, JPG, PNG)
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,image/*"
            onChange={handleFileChange}
            className="w-full text-white bg-gray-700 rounded border border-gray-600 p-2"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 flex justify-center items-center rounded"
        >
          {uploading ? 'Uploading...' : 'Submit Documents'}
        </button>
      </form>
    </div>
  );
}
