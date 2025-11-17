import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Music, Image, FileAudio, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Upload() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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

  // Redirect if not authenticated or not a producer
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/');
      } else if (user.account_type !== 'producer') {
        // Redirect buyers/artists to their dashboard
        navigate('/buyer');
      }
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated or not a producer
  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Please sign in to upload beats.</p>
        </div>
      </div>
    );
  }

  if (user.account_type !== 'producer') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Only producers can upload beats. Please sign up as a producer to access this feature.</p>
        </div>
      </div>
    );
  }

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
    // More flexible Google Drive link validation
    if (!link.trim()) return false;
    
    // Accept various Google Drive link formats
    const drivePatterns = [
      /drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/,
      /drive\.google\.com\/open\?id=[a-zA-Z0-9_-]+/,
      /drive\.google\.com\/uc\?id=[a-zA-Z0-9_-]+/,
      /docs\.google\.com\/.*\/d\/[a-zA-Z0-9_-]+/
    ];
    
    return drivePatterns.some(pattern => pattern.test(link));
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
      newErrors.preview = 'Please enter a valid Google Drive link for the preview file';
    }
    if (!driveLinks.fullBeat.trim()) {
      newErrors.fullBeat = 'Full beat Google Drive link is required';
    } else if (!validateDriveLink(driveLinks.fullBeat)) {
      newErrors.fullBeat = 'Please enter a valid Google Drive link for the full beat';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 Form submitted!');
    console.log('📝 Form data:', formData);
    console.log('🔗 Drive links:', driveLinks);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      console.log('🚨 Validation errors:', errors);
      return;
    }

    console.log('✅ Form validation passed!');

    try {
      setLoading(true);
      setUploadProgress(0);
      console.log('🚀 Starting upload process...');

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
    <div className="min-h-screen pt-20">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Upload Your <span className="gradient-text">Beat</span>
            </h1>
            <p className="text-xl text-slate-600">Share your music with the world and start earning</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-5 bg-green-50 border-2 border-green-200 rounded-xl animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
                <p className="text-green-800 font-semibold text-lg">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 text-xl">❌</span>
                </div>
                <p className="text-red-800 font-semibold">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {loading && (
            <div className="mb-8 card-elevated animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-slate-800 font-semibold">Uploading your beat...</span>
                </div>
                <span className="text-blue-600 font-bold text-lg">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-600 via-teal-500 to-orange-500 h-full rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}



          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="card-elevated">
              <div className="mb-6 pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>
                <p className="text-slate-600 mt-1">Tell us about your beat</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Beat Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`input-field ${errors.title ? 'input-field-error' : ''}`}
                    placeholder="Enter your beat title"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-2 font-medium">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Describe your beat, inspiration, or any additional information"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Genre</label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select Genre</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">BPM</label>
                    <input
                      type="number"
                      name="bpm"
                      value={formData.bpm}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="e.g., 140"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Key</label>
                    <select
                      name="key"
                      value={formData.key}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="">Select Key</option>
                      {keys.map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter tags separated by commas (e.g., trap, dark, aggressive)"
                  />
                </div>
              </div>
            </div>

            {/* Google Drive Links */}
            <div className="card-elevated">
              <div className="mb-6 pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Google Drive Links</h2>
                <p className="text-slate-600 mt-1">
                  Share your Google Drive links instead of uploading files directly. This is faster and more reliable!
                </p>
              </div>
              <div className="space-y-6">
                {/* Preview File */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Preview File Google Drive Link *</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 transition-colors bg-slate-50/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FileAudio className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">30-second Preview (MP3/WAV)</p>
                        <p className="text-sm text-slate-600">Share your Google Drive link for the preview file</p>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={driveLinks.preview}
                      onChange={(e) => handleDriveLinkChange('preview', e.target.value)}
                      className={`input-field ${errors.preview ? 'input-field-error' : ''}`}
                    />
                    {errors.preview && <p className="text-red-600 text-sm mt-2 font-medium">{errors.preview}</p>}
                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                      <span>💡</span>
                      <span>Make sure your Google Drive file is set to "Anyone with the link can view"</span>
                    </p>
                  </div>
                </div>

                {/* Full Beat File */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Full Beat File Google Drive Link *</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 transition-colors bg-slate-50/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                        <Music className="h-6 w-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Full Beat (WAV/MP3)</p>
                        <p className="text-sm text-slate-600">Share your Google Drive link for the full beat file</p>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/..."
                      value={driveLinks.fullBeat}
                      onChange={(e) => handleDriveLinkChange('fullBeat', e.target.value)}
                      className={`input-field ${errors.fullBeat ? 'input-field-error' : ''}`}
                    />
                    {errors.fullBeat && <p className="text-red-600 text-sm mt-2 font-medium">{errors.fullBeat}</p>}
                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                      <span>💡</span>
                      <span>Make sure your Google Drive file is set to "Anyone with the link can view"</span>
                    </p>
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Thumbnail Google Drive Link (Optional)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-blue-400 transition-colors bg-slate-50/50">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Image className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Thumbnail Image (JPG/PNG)</p>
                        <p className="text-sm text-slate-600">Share your Google Drive link for the thumbnail image</p>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/... (optional)"
                      value={driveLinks.thumbnail}
                      onChange={(e) => handleDriveLinkChange('thumbnail', e.target.value)}
                      className="input-field"
                    />
                    <p className="text-xs text-slate-500 mt-3">
                      💡 Optional: Add a thumbnail image for your beat
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="card-elevated">
              <div className="mb-6 pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Pricing</h2>
                <p className="text-slate-600 mt-1">Set your beat price</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">₦</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`input-field pl-10 ${errors.price ? 'input-field-error' : ''}`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.price && <p className="text-red-600 text-sm mt-2 font-medium">{errors.price}</p>}
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Platform fee: 5%</span>
                    <span className="mx-2">•</span>
                    You'll receive <span className="font-bold text-blue-600">₦{((parseFloat(formData.price) || 0) * 0.95).toLocaleString()}</span> per sale
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                disabled={loading}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto text-base px-8"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UploadIcon className="w-5 h-5" />
                    Upload Beat
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 