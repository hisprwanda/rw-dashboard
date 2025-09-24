import React, { useState } from "react";

const AudioUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Your existing credentials
  const urlForAudio = `https://play.im.dhis2.org/stable-2-42-1/api/fileResources`;
  const stableToken = `d2p_ZevZm0iEFvAxsZSTtVyzKpjAx85RCMfuAwpbuQBbx8Zp2LPx64`;

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
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Start progress simulation
      const progressInterval = simulateProgress();

      // Upload to DHIS2 fileResources API using fetch
      const response = await fetch(urlForAudio, {
        method: 'POST',
        headers: {
          'Authorization': `ApiToken ${stableToken}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      setUploadResponse(responseData);
      console.log('Upload successful:', responseData);
      
      // Check storage status
      if (responseData.storageStatus === 'PENDING') {
        console.log('File is being processed in background storage');
      }

    } catch (err) {
      console.error('Upload failed:', err);
      setError(
        err.message || 'Upload failed'
      );
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

  // Simple progress simulation since fetch doesn't support upload progress easily
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
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0l1 16a1 1 0 001 1h8a1 1 0 001-1L17 4M9 8v8m6-8v8"
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
            <p><strong>File ID:</strong> {uploadResponse.id}</p>
            <p><strong>Name:</strong> {uploadResponse.name}</p>
            <p><strong>Content Type:</strong> {uploadResponse.contentType}</p>
            <p><strong>Content Length:</strong> {formatFileSize(uploadResponse.contentLength)}</p>
            <p><strong>Storage Status:</strong> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                uploadResponse.storageStatus === 'STORED' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {uploadResponse.storageStatus}
              </span>
            </p>
            {uploadResponse.storageStatus === 'PENDING' && (
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
          <p><strong>Endpoint:</strong> {urlForAudio}</p>
          <p><strong>Method:</strong> POST (multipart/form-data)</p>
          <p><strong>Response:</strong> 202 Accepted with file resource details</p>
        </div>
      </div>
    </div>
  );
};

export default AudioUploader;