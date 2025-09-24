import React, { useState, useEffect, useRef } from "react";
import { useConfig } from '@dhis2/app-runtime';

const AudioUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const audioRef = useRef(null);

  // Use DHIS2 config to get base URL
  const { baseUrl } = useConfig();

  // Load audio files when component mounts or when switching to files tab
  useEffect(() => {
    if (activeTab === 'files') {
      loadAudioFiles();
    }
  }, [activeTab]);

  const loadAudioFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading audio files from DHIS2...');
      
      const response = await fetch(`${baseUrl}/api/fileResources?fields=*&paging=false`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load files: HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw file data:', data);

      // Filter only audio files
      const allFiles = data.fileResources || [];
      const audioFiles = allFiles.filter(file => 
        file.contentType && file.contentType.startsWith('audio/')
      );

      console.log(`Found ${audioFiles.length} audio files out of ${allFiles.length} total files`);
      setAudioFiles(audioFiles);

    } catch (err) {
      console.error('Failed to load audio files:', err);
      setError(`Failed to load audio files: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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

      console.log('Uploading file to DHIS2 fileResources API...');

      const response = await fetch(`${baseUrl}/api/fileResources`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorText = await response.text() || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorText);
      }

      const responseData = await response.json();
      console.log('Upload successful:', responseData);

      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadResponse(responseData);
      
      // Reload files list if we're on the files tab
      if (activeTab === 'files') {
        setTimeout(() => loadAudioFiles(), 1000); // Small delay to allow server processing
      }

    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      console.log(`Deleting file: ${fileId}`);
      
      const response = await fetch(`${baseUrl}/api/fileResources/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        } catch {
          errorText = await response.text() || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorText);
      }

      console.log('File deleted successfully');
      
      // Remove from local state
      setAudioFiles(prev => prev.filter(file => file.id !== fileId));
      
      // Stop playing if this file was currently playing
      if (currentlyPlaying === fileId) {
        handleStopPlaying();
      }

    } catch (err) {
      console.error('Delete failed:', err);
      setError(`Failed to delete file: ${err.message}`);
    }
  };

  const handlePlay = (fileId, fileName) => {
    if (currentlyPlaying === fileId) {
      handleStopPlaying();
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Start playing new audio
    const audioUrl = `${baseUrl}/api/fileResources/${fileId}/data`;
    console.log(`Playing audio: ${fileName} from ${audioUrl}`);
    
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(err => {
        console.error('Failed to play audio:', err);
        setError(`Failed to play audio: ${err.message}`);
      });
      
      setCurrentlyPlaying(fileId);
    }
  };

  const handleStopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setCurrentlyPlaying(null);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Simple progress simulation
  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      setUploadProgress(Math.round(progress));
      if (progress >= 90) clearInterval(interval);
    }, 200);
    return interval;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Hidden audio element for playback */}
      <audio 
        ref={audioRef} 
        onEnded={() => setCurrentlyPlaying(null)}
        onError={(e) => {
          console.error('Audio playback error:', e);
          setCurrentlyPlaying(null);
        }}
      />

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        DHIS2 Audio File Manager
      </h1>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'upload'
              ? 'bg-blue-600 text-white border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Upload Audio
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            activeTab === 'files'
              ? 'bg-blue-600 text-white border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          Manage Files ({audioFiles.length})
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
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
              </div>
              <button
                onClick={() => setActiveTab('files')}
                className="mt-3 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                View in Files Tab
              </button>
            </div>
          )}
        </div>
      )}

      {/* Files Management Tab */}
      {activeTab === 'files' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Audio Files</h2>
            <button
              onClick={loadAudioFiles}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Files Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading audio files...</p>
            </div>
          ) : audioFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No audio files found.</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Upload your first audio file
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {audioFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {file.name || 'Unnamed File'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {file.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(file.contentLength || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {file.contentType || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(file.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handlePlay(file.id, file.name)}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                            currentlyPlaying === file.id
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          } transition-colors`}
                        >
                          {currentlyPlaying === file.id ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6 4h2v12H6V4zm6 0h2v12h-2V4z"/>
                              </svg>
                              Stop
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 5v10l7-5-7-5z"/>
                              </svg>
                              Play
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(file.id, file.name)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z" clipRule="evenodd"/>
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Currently Playing Indicator */}
          {currentlyPlaying && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  <span className="text-sm text-blue-800">
                    Now playing: {audioFiles.find(f => f.id === currentlyPlaying)?.name || 'Unknown'}
                  </span>
                </div>
                <button
                  onClick={handleStopPlaying}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Stop
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-1">Error</h3>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* API Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
        <h3 className="font-medium text-blue-800 mb-2">API Information</h3>
        <div className="text-blue-700 space-y-1">
          <p><strong>Upload:</strong> POST {baseUrl}/api/fileResources</p>
          <p><strong>List:</strong> GET {baseUrl}/api/fileResources</p>
          <p><strong>Play:</strong> GET {baseUrl}/api/fileResources/[id]/data</p>
          <p><strong>Delete:</strong> DELETE {baseUrl}/api/fileResources/[id]</p>
        </div>
      </div>
    </div>
  );
};

export default AudioUploader;