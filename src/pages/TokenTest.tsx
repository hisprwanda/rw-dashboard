import React, { useState } from "react";
import { useConfig } from '@dhis2/app-runtime';

const AudioUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Use DHIS2 config to get base URL
  const { baseUrl } = useConfig();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if it's an audio file
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        setError(null);
        setUploadResponse(null);
      } else {
        setError('Please select a valid audio file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an audio file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResponse(null);
    setUploadProgress(0);

    try {
      // Start progress simulation
      const progressInterval = simulateProgress();

      // Check file size (DHIS2 may have limits)
      const maxFileSize = 50 * 1024 * 1024; // 50MB limit
      if (selectedFile.size > maxFileSize) {
        throw new Error(`File too large. Maximum size is ${formatFileSize(maxFileSize)}`);
      }

      console.log('Selected file details:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Debug: Log FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      console.log('Uploading file to DHIS2 fileResources API...');
      console.log('Upload URL:', `${baseUrl}/api/fileResources`);

      // Try multiple approaches
      let response;
      let responseData;

      try {
        // Approach 1: Standard fetch with FormData
        console.log('Attempting standard fetch upload...');
        response = await fetch(`${baseUrl}/api/fileResources`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        // If that fails, try the alternative documents endpoint
        if (!response.ok && response.status === 500) {
          console.log('Trying alternative documents endpoint...');
          response = await fetch(`${baseUrl}/api/documents`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        responseData = await response.json();
        console.log('Standard fetch successful:', responseData);

      } catch (fetchError) {
        console.log('Standard fetch failed, trying XMLHttpRequest...', fetchError);
        
        // Approach 2: XMLHttpRequest as fallback
        responseData = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const result = JSON.parse(xhr.responseText);
                  resolve(result);
                } catch (parseError) {
                  reject(new Error('Invalid JSON response'));
                }
              } else {
                try {
                  const errorData = JSON.parse(xhr.responseText);
                  reject(new Error(errorData.message || `HTTP ${xhr.status}: ${xhr.statusText}`));
                } catch {
                  reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
              }
            }
          };

          xhr.onerror = function() {
            reject(new Error('Network error occurred'));
          };

          // Open connection
          xhr.open('POST', `${baseUrl}/api/fileResources`, true);
          xhr.withCredentials = true;

          // Send FormData
          xhr.send(formData);
        });

        console.log('XMLHttpRequest successful:', responseData);
      }

      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadResponse(responseData);
      
      // Check storage status
      const storageStatus = responseData.response?.storageStatus || responseData.storageStatus;
      if (storageStatus === 'PENDING') {
        console.log('File is being processed in background storage');
      }

    } catch (err) {
      console.error('Upload failed:', err);
      
      let errorMessage = 'Upload failed';
      
      if (err.message.includes('Current request is not a multipart request')) {
        errorMessage = 'Multipart request error. This might be due to DHIS2 server configuration or proxy settings. Please check with your system administrator.';
      } else if (err.message.includes('502')) {
        errorMessage = 'Server error (502). The DHIS2 server may be experiencing issues. Please try again later or contact your system administrator.';
      } else if (err.message.includes('413') || err.message.includes('too large')) {
        errorMessage = 'File too large. Please choose a smaller audio file.';
      } else if (err.message.includes('415')) {
        errorMessage = 'Unsupported file type. Please ensure you are uploading a valid audio file.';
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        errorMessage = 'Authentication error. Please make sure you are logged in to DHIS2.';
      } else if (err.message.includes('403') || err.message.includes('Forbidden')) {
        errorMessage = 'Permission denied. You may not have the required permissions to upload files.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadResponse(null);
    setError(null);
    setIsUploading(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Simple progress simulation since we can't track real progress with fetch
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90; // Stop at 90% until actual completion
      setUploadProgress(Math.round(progress));
      if (progress >= 90) clearInterval(interval);
    }, 200);
    return interval;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        DHIS2 Audio File Uploader
      </h1>

      {/* File Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Audio File
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            id="audio-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="audio-upload"
            className={`cursor-pointer ${isUploading ? 'cursor-not-allowed' : ''}`}
          >
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                {' '}or drag and drop
              </div>
              <p className="text-xs text-gray-500">
                MP3, WAV, OGG, M4A files supported
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Selected File:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>
          
          {/* Audio Preview */}
          <div className="mt-3">
            <audio controls className="w-full">
              <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Upload Audio'}
        </button>
        
        <button
          onClick={resetUpload}
          disabled={isUploading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Success Response */}
      {uploadResponse && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Upload Successful!</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>File ID:</strong> {uploadResponse.response?.uid || uploadResponse.uid || uploadResponse.id || 'N/A'}</p>
            {(uploadResponse.response?.name || uploadResponse.name) && (
              <p><strong>Name:</strong> {uploadResponse.response?.name || uploadResponse.name}</p>
            )}
            {(uploadResponse.response?.contentType || uploadResponse.contentType) && (
              <p><strong>Content Type:</strong> {uploadResponse.response?.contentType || uploadResponse.contentType}</p>
            )}
            {(uploadResponse.response?.contentLength || uploadResponse.contentLength) && (
              <p><strong>Content Length:</strong> {formatFileSize(uploadResponse.response?.contentLength || uploadResponse.contentLength)}</p>
            )}
            {(uploadResponse.response?.storageStatus || uploadResponse.storageStatus) && (
              <p><strong>Storage Status:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  (uploadResponse.response?.storageStatus || uploadResponse.storageStatus) === 'STORED' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {uploadResponse.response?.storageStatus || uploadResponse.storageStatus}
                </span>
              </p>
            )}
            {(uploadResponse.response?.storageStatus || uploadResponse.storageStatus) === 'PENDING' && (
              <p className="text-xs text-yellow-600 mt-2">
                ⏳ File is being processed and stored in background
              </p>
            )}
          </div>
          
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-green-600 hover:text-green-500">
              View Full Response
            </summary>
            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-40">
              {JSON.stringify(uploadResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-1">Upload Failed</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* API Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <h3 className="font-medium text-blue-800 mb-2">API Information</h3>
        <div className="text-blue-700 space-y-1">
          <p><strong>Endpoint:</strong> {baseUrl}/api/fileResources</p>
          <p><strong>Method:</strong> POST (multipart/form-data)</p>
          <p><strong>Authentication:</strong> Handled by DHIS2 App Context</p>
          <p><strong>Response:</strong> 202 Accepted with file resource details</p>
        </div>
      </div>
    </div>
  );
};

export default AudioUploader;