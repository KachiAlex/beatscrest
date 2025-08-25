import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Music, Image, FileAudio, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import apiService from '../services/api';

export default function Upload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    bpm: '',
    key: '',
    price: '',
    tags: ''
  });
  const [files, setFiles] = useState({
    preview: null as File | null,
    fullBeat: null as File | null,
    thumbnail: null as File | null
  });
  const [driveLinks, setDriveLinks] = useState({
    preview: '',
    fullBeat: '',
    thumbnail: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const genres = ['Hip Hop', 'R&B', 'Afrobeats', 'Pop', 'Trap', 'Drill', 'Amapiano', 'Gospel', 'Jazz', 'Electronic'];
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleDriveLinkChange = (field: keyof typeof driveLinks, link: string) => {
    setDriveLinks(prev => ({
      ...prev,
      [field]: link
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateDriveLink = (link: string): boolean => {
    // Basic Google Drive link validation
    return link.includes('drive.google.com') && (link.includes('/file/d/') || link.includes('/open?id='));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!driveLinks.preview.trim()) {
      newErrors.preview = 'Preview Google Drive link is required';
    } else if (!validateDriveLink(driveLinks.preview)) {
      newErrors.preview = 'Please enter a valid Google Drive link';
    }
    if (!driveLinks.fullBeat.trim()) {
      newErrors.fullBeat = 'Full beat Google Drive link is required';
    } else if (!validateDriveLink(driveLinks.fullBeat)) {
      newErrors.fullBeat = 'Please enter a valid Google Drive link';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', { formData, driveLinks });
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      console.log('Starting upload process...');

      const uploadData = {
        ...formData,
        preview_url: driveLinks.preview,
        full_beat_url: driveLinks.fullBeat,
        thumbnail_url: driveLinks.thumbnail || null
      };
      
      console.log('Upload data prepared:', uploadData);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Calling uploadBeat API...');
      const response = await apiService.uploadBeat(uploadData);
      console.log('Upload response:', response);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Show success message
      setSuccessMessage('Beat uploaded successfully! Redirecting...');
      
      // Navigate to the beat detail page after a short delay
      setTimeout(() => {
        navigate(`/beat/${response.data.beat.id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error uploading beat:', error);
      setErrors({ submit: error.message || 'Failed to upload beat' });
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (field: keyof typeof files) => {
    setFiles(prev => ({
      ...prev,
      [field]: null
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Your Beat</h1>
            <p className="text-lg text-gray-600">Share your music with the world and start earning</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 font-medium">Uploading your beat...</span>
                <span className="text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Test Upload Button */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 mb-2">For testing purposes:</p>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: 'Test Beat',
                  description: 'A test beat for development',
                  genre: 'Hip Hop',
                  bpm: '140',
                  key: 'C',
                  price: '45000',
                  tags: 'test, hip-hop'
                });
                setDriveLinks({
                  preview: 'https://drive.google.com/file/d/test1',
                  fullBeat: 'https://drive.google.com/file/d/test2',
                  thumbnail: 'https://drive.google.com/file/d/test3'
                });
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Fill Test Data
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Beat Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter your beat title"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe your beat, inspiration, or any additional information"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Genre</label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Genre</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">BPM</label>
                    <input
                      type="number"
                      name="bpm"
                      value={formData.bpm}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., 140"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Key</label>
                    <select
                      name="key"
                      value={formData.key}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Key</option>
                      {keys.map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter tags separated by commas (e.g., trap, dark, aggressive)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Google Drive Links */}
            <Card>
              <CardHeader>
                <CardTitle>Google Drive Links</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Share your Google Drive links instead of uploading files directly. This is faster and more reliable!
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview File */}
                <div>
                  <label className="block text-sm font-medium mb-2">Preview File Google Drive Link *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileAudio className="h-8 w-8 text-teal-600" />
                      <div>
                        <p className="font-medium">30-second Preview (MP3/WAV)</p>
                        <p className="text-sm text-gray-500">Share your Google Drive link for the preview file</p>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={driveLinks.preview}
                      onChange={(e) => handleDriveLinkChange('preview', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Make sure your Google Drive file is set to "Anyone with the link can view"
                    </p>
                  </div>
                  {errors.preview && <p className="text-red-600 text-sm mt-1">{errors.preview}</p>}
                </div>

                {/* Full Beat File */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Beat File Google Drive Link *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Music className="h-8 w-8 text-teal-600" />
                      <div>
                        <p className="font-medium">Full Beat (WAV/MP3)</p>
                        <p className="text-sm text-gray-500">Share your Google Drive link for the full beat file</p>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={driveLinks.fullBeat}
                      onChange={(e) => handleDriveLinkChange('fullBeat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Make sure your Google Drive file is set to "Anyone with the link can view"
                    </p>
                  </div>
                  {errors.fullBeat && <p className="text-red-600 text-sm mt-1">{errors.fullBeat}</p>}
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail Google Drive Link (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Image className="h-8 w-8 text-teal-600" />
                      <div>
                        <p className="font-medium">Thumbnail Image (JPG/PNG)</p>
                        <p className="text-sm text-gray-500">Share your Google Drive link for the thumbnail image</p>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/... (optional)"
                      value={driveLinks.thumbnail}
                      onChange={(e) => handleDriveLinkChange('thumbnail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Optional: Add a thumbnail image for your beat
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₦) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                  <p className="text-sm text-gray-500 mt-2">
                    Platform fee: 5% • You'll receive ₦{(parseFloat(formData.price) || 0) * 0.95} per sale
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {loading && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Uploading...</span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/marketplace')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Beat'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 