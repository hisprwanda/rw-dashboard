import React, { useState, useRef, useEffect } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { 
  Button, 
  Card, 
  Input, 
  CircularLoader, 
  NoticeBox, 
  Divider,
  Table,
  TableHead,
  TableRowHead,
  TableCellHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  ButtonStrip,
  LinearLoader,
  IconUpload24,
} from '@dhis2/ui';

const AudioStoragePage = () => {
    const engine = useDataEngine();
    const [audioFile, setAudioFile] = useState(null);
    const [audioName, setAudioName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [storedAudios, setStoredAudios] = useState([]);
    const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, audio: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'uploadDate', direction: 'desc' });
    const fileInputRef = useRef(null);
    const audioRef = useRef(null);

    // Load stored audios on component mount
    useEffect(() => {
        loadStoredAudios();
    }, []);

    const loadStoredAudios = async () => {
        setIsLoading(true);
        try {
            // Query to get all keys in the audio namespace
            const response = await engine.query({
                keys: {
                    resource: 'dataStore/audio'
                }
            });

            if (response.keys && response.keys.length > 0) {
                // Fetch each audio file
                const audioPromises = response.keys.map(async (key) => {
                    try {
                        const audioData = await engine.query({
                            audio: {
                                resource: `dataStore/audio/${key}`
                            }
                        });
                        return { key, ...audioData.audio };
                    } catch (error) {
                        console.error(`Error loading audio ${key}:`, error);
                        return null;
                    }
                });

                const audios = (await Promise.all(audioPromises)).filter(Boolean);
                setStoredAudios(audios);
            } else {
                setStoredAudios([]);
            }
        } catch (error) {
            console.error('Error loading stored audios:', error);
            setMessage({ text: 'No stored audios found or error loading them', type: 'warning' });
        }
        setIsLoading(false);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg', 'audio/m4a'];
            if (!validTypes.includes(file.type)) {
                setMessage({ text: 'Please select a valid audio file (MP3, WAV, OGG, M4A)', type: 'critical' });
                return;
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setMessage({ text: 'File size must be less than 10MB for optimal performance', type: 'warning' });
                return;
            }

            setAudioFile(file);
            setAudioName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
            setMessage({ text: '', type: '' });
        }
    };

    const convertAudioToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Remove data:audio/... prefix
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async () => {
        if (!audioFile || !audioName.trim()) {
            setMessage({ text: 'Please select an audio file and provide a name', type: 'critical' });
            return;
        }

        setIsUploading(true);
        setMessage({ text: '', type: '' });

        try {
            // Convert audio to base64
            const base64Data = await convertAudioToBase64(audioFile);
            
            // Create audio JSON object
            const audioJSON = {
                id: Date.now().toString(),
                name: audioName.trim(),
                originalName: audioFile.name,
                format: audioFile.type.split('/')[1] || 'mp3',
                base64Data: base64Data,
                metadata: {
                    size: audioFile.size,
                    duration: 0, // Could be extracted with HTML5 audio
                    uploadDate: new Date().toISOString(),
                    mimeType: audioFile.type
                }
            };

            // Generate unique key (timestamp + name)
            const key = `${Date.now()}_${audioName.trim().replace(/[^a-zA-Z0-9]/g, '_')}`;

            // Store in DHIS2 data store
            await engine.mutate({
                resource: `dataStore/audio/${key}`,
                type: 'create',
                data: audioJSON
            });

            setMessage({ text: `Audio "${audioName}" uploaded successfully!`, type: 'success' });
            
            // Reset form
            setAudioFile(null);
            setAudioName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Reload the list
            loadStoredAudios();

        } catch (error) {
            console.error('Upload error:', error);
            setMessage({ 
                text: `Upload failed: ${error.message || 'Unknown error'}`, 
                type: 'critical' 
            });
        }

        setIsUploading(false);
    };

    const playAudio = (audioData) => {
        try {
            // Stop current audio if playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            // Create data URL from base64
            const dataURL = `data:${audioData.metadata.mimeType};base64,${audioData.base64Data}`;
            
            // Create and play audio
            const audio = new Audio(dataURL);
            audioRef.current = audio;

            audio.onloadstart = () => setCurrentlyPlaying(audioData.id);
            audio.onended = () => setCurrentlyPlaying(null);
            audio.onerror = () => {
                setCurrentlyPlaying(null);
                setMessage({ text: 'Error playing audio file', type: 'critical' });
            };

            audio.play().catch(error => {
                console.error('Play error:', error);
                setMessage({ text: 'Could not play audio file', type: 'critical' });
                setCurrentlyPlaying(null);
            });

        } catch (error) {
            console.error('Audio play error:', error);
            setMessage({ text: 'Error creating audio player', type: 'critical' });
        }
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        setCurrentlyPlaying(null);
    };

    const confirmDelete = (audio) => {
        setDeleteModal({ open: true, audio });
    };

    const deleteAudio = async () => {
        const { audio } = deleteModal;
        try {
            await engine.mutate({
                resource: `dataStore/audio/${audio.key}`,
                type: 'delete'
            });

            setMessage({ text: `Audio "${audio.name}" deleted successfully`, type: 'success' });
            loadStoredAudios();
        } catch (error) {
            console.error('Delete error:', error);
            setMessage({ text: `Failed to delete audio: ${error.message}`, type: 'critical' });
        }
        setDeleteModal({ open: false, audio: null });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter and sort audios
    const filteredAndSortedAudios = storedAudios
        .filter(audio => 
            audio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            audio.originalName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortConfig.key === 'uploadDate') {
                const aDate = new Date(a.metadata.uploadDate);
                const bDate = new Date(b.metadata.uploadDate);
                return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
            } else if (sortConfig.key === 'size') {
                return sortConfig.direction === 'asc' 
                    ? a.metadata.size - b.metadata.size 
                    : b.metadata.size - a.metadata.size;
            } else {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                return sortConfig.direction === 'asc' 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            }
        });

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#2c3e50', marginBottom: '8px' }}>
                    Audio Management System
                </h1>
                <p style={{ color: '#6c757d', fontSize: '16px' }}>
                    Upload, manage, and organize your audio files for DHIS2 presentations
                </p>
            </div>
            
            {/* Upload Section */}
            <Card style={{ marginBottom: '32px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconUpload24 />
                        Upload New Audio
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div>
                            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', color: '#495057' }}>
                                Select Audio File
                            </label>
                            <div style={{ 
                                position: 'relative', 
                                border: '2px dashed #dee2e6', 
                                borderRadius: '8px', 
                                padding: '20px', 
                                textAlign: 'center',
                                backgroundColor: audioFile ? '#e8f5e8' : '#fff',
                                borderColor: audioFile ? '#28a745' : '#dee2e6',
                                transition: 'all 0.3s ease'
                            }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileSelect}
                                    style={{ 
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        opacity: 0,
                                        cursor: 'pointer'
                                    }}
                                />
                                <div style={{ pointerEvents: 'none' }}>
                                    <IconUpload24 style={{ color: '#6c757d', marginBottom: '8px' }} />
                                    <p style={{ margin: 0, color: '#6c757d' }}>
                                        {audioFile ? audioFile.name : 'Click or drag to upload audio file'}
                                    </p>
                                    <small style={{ color: '#868e96' }}>
                                        Supported: MP3, WAV, OGG, M4A (Max 10MB)
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Input
                                label="Audio Name"
                                value={audioName}
                                onChange={({ value }) => setAudioName(value)}
                                placeholder="Enter a descriptive name for your audio"
                                style={{ marginBottom: '16px' }}
                            />
                            
                            {audioFile && (
                                <div style={{ 
                                    padding: '12px', 
                                    backgroundColor: '#e9ecef', 
                                    borderRadius: '6px', 
                                    fontSize: '14px',
                                    border: '1px solid #dee2e6'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '500' }}>File:</span>
                                        <span>{audioFile.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '500' }}>Size:</span>
                                        <span>{formatFileSize(audioFile.size)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '500' }}>Type:</span>
                                        <span>{audioFile.type}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            primary 
                            onClick={handleUpload}
                            disabled={!audioFile || !audioName.trim() || isUploading}
                            loading={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Audio'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Messages */}
            {message.text && (
                <div style={{ marginBottom: '24px' }}>
                    <NoticeBox 
                        title={message.type === 'success' ? 'Success' : message.type === 'warning' ? 'Warning' : 'Error'}
                        {...(message.type === 'success' && { success: true })}
                        {...(message.type === 'warning' && { warning: true })}
                        {...(message.type === 'critical' && { error: true })}
                    >
                        {message.text}
                    </NoticeBox>
                </div>
            )}

            {/* Audio Library Section */}
            <Card style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50', margin: 0 }}>
                            Audio Library ({filteredAndSortedAudios.length} {filteredAndSortedAudios.length === 1 ? 'file' : 'files'})
                        </h2>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Input
                                placeholder="Search audio files..."
                                value={searchTerm}
                                onChange={({ value }) => setSearchTerm(value)}
                                style={{ width: '250px' }}
                            />
                            <Button 
                                secondary 
                                onClick={loadStoredAudios} 
                                disabled={isLoading}
                                loading={isLoading}
                            
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {isLoading && <LinearLoader amount={undefined} />}

                    {!isLoading && filteredAndSortedAudios.length === 0 ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            color: '#6c757d'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🎵</div>
                            <h3 style={{ marginBottom: '8px', color: '#495057' }}>
                                {searchTerm ? 'No matching audio files' : 'No audio files yet'}
                            </h3>
                            <p style={{ margin: 0 }}>
                                {searchTerm 
                                    ? 'Try adjusting your search terms'
                                    : 'Upload your first audio file to get started!'
                                }
                            </p>
                        </div>
                    ) : !isLoading && (
                        <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                            <Table>
                                <TableHead>
                                    <TableRowHead>
                                        <TableCellHead 
                                            onClick={() => handleSort('name')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableCellHead>
                                        <TableCellHead>Original File</TableCellHead>
                                        <TableCellHead 
                                            onClick={() => handleSort('format')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            Format {sortConfig.key === 'format' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableCellHead>
                                        <TableCellHead 
                                            onClick={() => handleSort('size')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            Size {sortConfig.key === 'size' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableCellHead>
                                        <TableCellHead 
                                            onClick={() => handleSort('uploadDate')}
                                            style={{ cursor: 'pointer', userSelect: 'none' }}
                                        >
                                            Upload Date {sortConfig.key === 'uploadDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </TableCellHead>
                                        <TableCellHead>Actions</TableCellHead>
                                    </TableRowHead>
                                </TableHead>
                                <TableBody>
                                    {filteredAndSortedAudios.map((audio) => (
                                        <TableRow key={audio.key}>
                                            <TableCell>
                                                <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                                                    {audio.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span style={{ color: '#6c757d', fontSize: '14px' }}>
                                                    {audio.originalName}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span style={{ 
                                                    backgroundColor: '#e9ecef', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '12px', 
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {audio.format}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatFileSize(audio.metadata.size)}</TableCell>
                                            <TableCell>
                                                <span style={{ color: '#6c757d', fontSize: '14px' }}>
                                                    {formatDate(audio.metadata.uploadDate)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {currentlyPlaying === audio.id ? (
                                                        <Button 
                                                            small 
                                                            destructive 
                                                            onClick={stopAudio}
                                                          
                                                        >
                                                            Stop
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            small 
                                                            primary 
                                                            onClick={() => playAudio(audio)}
                                                         
                                                        >
                                                            Play
                                                        </Button>
                                                    )}
                                                    
                                                    <Button 
                                                        small 
                                                        destructive 
                                                        onClick={() => confirmDelete(audio)}
                                                 
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <Modal onClose={() => setDeleteModal({ open: false, audio: null })}>
                    <ModalTitle>Confirm Deletion</ModalTitle>
                    <ModalContent>
                        <p>Are you sure you want to delete the audio file "<strong>{deleteModal.audio?.name}</strong>"?</p>
                        <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '12px' }}>
                            This action cannot be undone.
                        </p>
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip end>
                            <Button secondary onClick={() => setDeleteModal({ open: false, audio: null })}>
                                Cancel
                            </Button>
                            <Button destructive onClick={deleteAudio}>
                                Delete Audio
                            </Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </div>
    );
};

export default AudioStoragePage;