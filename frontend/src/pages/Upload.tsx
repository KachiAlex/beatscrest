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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!files.preview) {
      newErrors.preview = 'Preview file is required';
    }
    if (!files.fullBeat) {
      newErrors.fullBeat = 'Full beat file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const uploadFormData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          uploadFormData.append(key, value);
        }
      });

      // Add files
      if (files.preview) {
        uploadFormData.append('preview', files.preview);
      }
      if (files.fullBeat) {
        uploadFormData.append('fullBeat', files.fullBeat);
      }
      if (files.thumbnail) {
        uploadFormData.append('thumbnail', files.thumbnail);
      }

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

      const response = await apiService.uploadBeat(uploadFormData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Navigate to the beat detail page
      navigate(`/beat/${response.beat.id}`);
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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

            {/* File Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview File */}
                <div>
                  <label className="block text-sm font-medium mb-2">Preview File *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {files.preview ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileAudio className="h-8 w-8 text-purple-600" />
                          <div className="text-left">
                            <p className="font-medium">{files.preview.name}</p>
                            <p className="text-sm text-gray-500">
                              {(files.preview.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('preview')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <FileAudio className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Upload a 30-second preview (MP3/WAV)</p>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleFileChange('preview', e.target.files?.[0] || null)}
                          className="hidden"
                          id="preview-upload"
                        />
                        <label htmlFor="preview-upload">
                          <Button variant="outline" className="cursor-pointer">
                            <UploadIcon className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.preview && <p className="text-red-600 text-sm mt-1">{errors.preview}</p>}
                </div>

                {/* Full Beat File */}
                <div>
                  <label className="block text-sm font-medium mb-2">Full Beat File *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {files.fullBeat ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Music className="h-8 w-8 text-purple-600" />
                          <div className="text-left">
                            <p className="font-medium">{files.fullBeat.name}</p>
                            <p className="text-sm text-gray-500">
                              {(files.fullBeat.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('fullBeat')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Upload the full beat (WAV/MP3)</p>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleFileChange('fullBeat', e.target.files?.[0] || null)}
                          className="hidden"
                          id="fullbeat-upload"
                        />
                        <label htmlFor="fullbeat-upload">
                          <Button variant="outline" className="cursor-pointer">
                            <UploadIcon className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                  {errors.fullBeat && <p className="text-red-600 text-sm mt-1">{errors.fullBeat}</p>}
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {files.thumbnail ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Image className="h-8 w-8 text-purple-600" />
                          <div className="text-left">
                            <p className="font-medium">{files.thumbnail.name}</p>
                            <p className="text-sm text-gray-500">
                              {(files.thumbnail.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile('thumbnail')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Upload a thumbnail image (JPG/PNG)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('thumbnail', e.target.files?.[0] || null)}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label htmlFor="thumbnail-upload">
                          <Button variant="outline" className="cursor-pointer">
                            <UploadIcon className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                        </label>
                      </div>
                    )}
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