import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, ShoppingCart, MessageCircle, Share2, Clock, Music, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Beat, Comment, BeatFeedback, FeedbackStats as FeedbackStatsType } from '../types';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';
import FeedbackStatsComponent from '../components/FeedbackStats';
import CommentItem from '../components/CommentItem';

export default function BeatDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [beat, setBeat] = useState<Beat | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [feedback, setFeedback] = useState<BeatFeedback[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<BeatFeedback | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (id) {
      loadBeat();
      loadComments();
      loadFeedback();
    }
  }, [id]);

  const loadBeat = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBeat(parseInt(id!));
      setBeat(response.beat);
    } catch (error) {
      console.error('Error loading beat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await apiService.getBeatComments(parseInt(id!));
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadFeedback = async () => {
    if (!id) return;
    
    try {
      setFeedbackLoading(true);
      const [feedbackResponse, statsResponse] = await Promise.all([
        apiService.getBeatFeedback(parseInt(id)),
        apiService.getFeedbackStats(parseInt(id))
      ]);
      
      setFeedback(feedbackResponse.feedback || []);
      setFeedbackStats(statsResponse.stats);
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleLike = async () => {
    if (!beat) return;
    
    try {
      await apiService.likeBeat(beat.id);
      setBeat(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1
      } : null);
    } catch (error) {
      console.error('Error liking beat:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !beat) return;

    try {
      setSubmittingComment(true);
      const response = await apiService.addComment(beat.id, comment.trim());
      setComments(prev => [response.comment, ...prev]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePurchase = async () => {
    if (!beat) return;
    
    if (!user) {
      // Show auth modal for unauthenticated users
      console.log('User not authenticated, showing auth modal');
      setShowAuthModal(true);
      return;
    }
    
    try {
      // Navigate to payment flow
      console.log('User authenticated, navigating to payment:', `/payment/${beat.id}`);
      navigate(`/payment/${beat.id}`);
    } catch (error) {
      console.error('Error initiating purchase:', error);
    }
  };

  // Handle auth form input changes
  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setAuthError('');
  };

  // Handle auth form submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (authMode === 'signin') {
        await apiService.login({ email: authFormData.email, password: authFormData.password });
      } else {
        await apiService.register({
          email: authFormData.email,
          password: authFormData.password,
          username: authFormData.username,
          account_type: 'artist'
        });
      }
      
      setShowAuthModal(false);
      setAuthFormData({ email: '', password: '', username: '' });
      setAuthMode('signin');
      
      // Navigate to payment flow after successful auth
      if (beat) {
        console.log('Authentication successful, navigating to payment:', `/payment/${beat.id}`);
        navigate(`/payment/${beat.id}`);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // Switch between sign in and sign up modes
  const switchAuthMode = () => {
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setAuthError('');
    setAuthFormData({ email: '', password: '', username: '' });
  };

  // Feedback handling functions
  const handleSubmitFeedback = async (rating: number, comment: string) => {
    if (!beat || !user) return;

    try {
      setSubmittingFeedback(true);
      
      if (editingFeedback) {
        const response = await apiService.updateFeedback(editingFeedback.id, rating, comment);
        setFeedback(prev => prev.map(f => f.id === editingFeedback.id ? response.feedback : f));
        setEditingFeedback(null);
      } else {
        const response = await apiService.submitFeedback(beat.id, rating, comment);
        setFeedback(prev => [response.feedback, ...prev]);
      }
      
      setShowFeedbackForm(false);
      await loadFeedback(); // Reload stats
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleEditFeedback = (feedbackItem: BeatFeedback) => {
    setEditingFeedback(feedbackItem);
    setShowFeedbackForm(true);
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!confirm('Are you sure you want to delete your review?')) return;

    try {
      await apiService.deleteFeedback(feedbackId);
      setFeedback(prev => prev.filter(f => f.id !== feedbackId));
      await loadFeedback(); // Reload stats
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const handleCancelFeedback = () => {
    setShowFeedbackForm(false);
    setEditingFeedback(null);
  };

  // New function for adding comment responses
  const handleAddCommentResponse = async (commentId: number, responseText: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await apiService.addCommentResponse(commentId, responseText);
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, responses: [response.response, ...c.responses] } : c
      ));
    } catch (error) {
      console.error('Error adding comment response:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading beat...</p>
        </div>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="p-6 rounded-full bg-slate-100 w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Music className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Beat Not Found</h2>
          <p className="text-slate-600 mb-6 text-lg">The beat you're looking for doesn't exist or has been removed.</p>
          <Link to="/marketplace">
            <button className="btn-primary">
              Browse Beats
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Beat Header */}
            <div className="card-elevated">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">{beat.title}</h1>
                  {beat.producer_name && (
                    <Link 
                      to={`/profile/${beat.producer_name}`}
                      className="text-lg text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2 hover:underline transition-colors"
                    >
                      <span>by {beat.producer_name}</span>
                      <span className="text-sm">→</span>
                    </Link>
                  )}
                  {feedbackStats && (
                    <div className="flex items-center gap-3 mt-4">
                      <StarRating
                        rating={Math.round(feedbackStats.average_rating)}
                        readonly
                        size="sm"
                        showValue
                      />
                      <span className="text-sm text-slate-600 font-medium">
                        ({feedbackStats.total_ratings} {feedbackStats.total_ratings === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right w-full md:w-auto">
                  <div className="text-4xl font-bold gradient-text mb-4">
                    ₦{beat.price.toLocaleString()}
                  </div>
                  <button 
                    onClick={handlePurchase}
                    className="btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2 text-base font-semibold"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {user ? 'Buy Now' : 'Sign in to Purchase'}
                  </button>
                </div>
              </div>

              {/* Audio Player */}
              <div className="bg-gradient-to-br from-slate-100 to-blue-50/50 rounded-2xl p-6 mb-6 border-2 border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                    </button>
                    <div>
                      <div className="font-bold text-slate-900">Preview</div>
                      <div className="text-sm text-slate-600 font-medium">30 seconds</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLike}
                      className={`p-3 rounded-xl transition-colors flex items-center gap-2 ${
                        beat.is_liked 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${beat.is_liked ? 'fill-current' : ''}`} />
                      <span className="font-semibold">{beat.likes_count || 0}</span>
                    </button>
                    <button className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: '30%' }}></div>
                </div>
              </div>

              {/* Beat Info */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 pt-6 border-t border-slate-200">
                <div className="text-center p-4 rounded-xl bg-slate-50">
                  <div className="text-3xl font-bold gradient-text mb-1">{beat.bpm || 'N/A'}</div>
                  <div className="text-sm text-slate-600 font-medium">BPM</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50">
                  <div className="text-3xl font-bold gradient-text mb-1">{beat.key || 'N/A'}</div>
                  <div className="text-sm text-slate-600 font-medium">Key</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{beat.likes_count || 0}</div>
                  <div className="text-sm text-slate-600 font-medium">Likes</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{beat.plays_count || 0}</div>
                  <div className="text-sm text-slate-600 font-medium">Plays</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-slate-50">
                  <div className="text-3xl font-bold gradient-text mb-1">
                    {feedbackStats ? feedbackStats.average_rating.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Rating</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                {beat.genre && (
                  <span className="badge-primary text-sm">{beat.genre}</span>
                )}
                {beat.tags?.map((tag, index) => (
                  <span key={index} className="badge bg-slate-100 text-slate-700 text-sm">{tag}</span>
                ))}
              </div>
            </div>

            {/* Description */}
            {beat.description && (
              <div className="card-elevated">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Description</h3>
                <p className="text-slate-700 leading-relaxed text-lg">{beat.description}</p>
              </div>
            )}

            {/* Comments */}
            <div className="card-elevated">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Comments</h3>
              
              {/* Add Comment */}
              {user && (
                <form onSubmit={handleComment} className="mb-8">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 input-field"
                      disabled={submittingComment}
                    />
                      <Button 
                        type="submit" 
                        disabled={!comment.trim() || submittingComment}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {submittingComment ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={user?.id}
                      isProducer={user?.id === beat.producer_id}
                      onAddResponse={handleAddCommentResponse}
                    />
                  ))}
                  
                  {comments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
            </div>

            {/* Feedback Section */}
            <div className="card-elevated">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">Reviews & Ratings</h3>
                {user && !showFeedbackForm && (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Star className="h-5 w-5" />
                    Write a Review
                  </button>
                )}
              </div>

              {/* Feedback Stats */}
              {feedbackStats && (
                <div className="mb-6">
                  <FeedbackStatsComponent stats={feedbackStats} />
                </div>
              )}

              {/* Feedback Form */}
              {showFeedbackForm && user && (
                <div className="mb-6">
                  <FeedbackForm
                    onSubmit={handleSubmitFeedback}
                    onCancel={handleCancelFeedback}
                    initialRating={editingFeedback?.rating || 0}
                    initialComment={editingFeedback?.comment || ''}
                    isEditing={!!editingFeedback}
                    loading={submittingFeedback}
                  />
                </div>
              )}

              {/* Feedback List */}
              <FeedbackList
                feedback={feedback}
                currentUserId={user?.id}
                onEdit={handleEditFeedback}
                onDelete={handleDeleteFeedback}
                loading={feedbackLoading}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Producer Info */}
            {beat.producer_name && (
              <div className="card-elevated">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Producer</h3>
                <div className="flex items-center gap-3 mb-4">
                  {beat.producer_picture ? (
                    <img
                      src={beat.producer_picture}
                      alt={beat.producer_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center border-2 border-slate-200">
                      <span className="text-white font-bold text-lg">{beat.producer_name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <Link 
                      to={`/profile/${beat.producer_name}`}
                      className="font-bold text-blue-600 hover:text-blue-700 text-lg"
                    >
                      {beat.producer_name}
                    </Link>
                    <div className="text-sm text-slate-600">Producer</div>
                  </div>
                </div>
                <Link to={`/profile/${beat.producer_name}`}>
                  <button className="btn-secondary w-full">
                    View Profile
                  </button>
                </Link>
              </div>
            )}

            {/* Purchase Info */}
            <div className="card-elevated">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Purchase Details</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Beat Price</span>
                  <span className="font-bold text-slate-900">₦{beat.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Platform Fee (5%)</span>
                  <span className="font-bold text-slate-900">₦{(beat.price * 0.05).toLocaleString()}</span>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-slate-900">Total</span>
                  <span className="gradient-text">₦{beat.price.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-sm text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Instant download after purchase</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-blue-600" />
                  <span>Full quality WAV/MP3 files</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {authMode === 'signin' ? 'Sign In to Purchase' : 'Create Account to Purchase'}
              </h3>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthMode('signin');
                  setAuthFormData({ email: '', password: '', username: '' });
                  setAuthError('');
                }} 
                className="rounded-xl px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    value={authFormData.username}
                    onChange={handleAuthInputChange}
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" 
                    placeholder="your_username" 
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={authFormData.email}
                  onChange={handleAuthInputChange}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="you@example.com" 
                  required
                />
              </div>
              
              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={authFormData.password}
                  onChange={handleAuthInputChange}
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="••••••••" 
                  required
                />
              </div>
              
              {authError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {authError}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={authLoading}
                className="w-full inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-white shadow-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <span className="font-medium">
                    {authMode === 'signin' ? 'Sign In & Continue' : 'Create Account & Continue'}
                  </span>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {authMode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={switchAuthMode}
                  className="ml-1 text-purple-600 hover:text-purple-700 font-medium"
                >
                  {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 