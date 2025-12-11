"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadStatus('');

    try {
      // TODO: Implement actual upload to backend
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadStatus('File uploaded successfully!');
      setFile(null);
    } catch (error) {
      setUploadStatus('Error uploading file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Hospital Data</h1>
      
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload CSV or Excel File</h2>
          <p className="text-gray-600 mb-4">
            Upload hospital data in CSV or Excel format. The file should contain columns for:
            name, email, phone, address, services, beds, doctors, etc.
          </p>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Select File
          </label>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Selected file:</span> {file.name}
            </p>
            <p className="text-sm text-gray-500">
              Size: {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>

        {uploadStatus && (
          <div className={`mt-4 p-4 rounded ${
            uploadStatus.includes('success') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {uploadStatus}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold mb-3">File Format Guidelines:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>CSV or Excel format (.csv, .xlsx, .xls)</li>
            <li>First row should contain column headers</li>
            <li>Required columns: name, email, phone</li>
            <li>Optional columns: address, latitude, longitude, services, beds, doctors</li>
            <li>Maximum file size: 10 MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
