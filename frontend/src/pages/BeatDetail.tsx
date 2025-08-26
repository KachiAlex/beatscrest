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
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Beat Not Found</h2>
          <p className="text-gray-600 mb-4">The beat you're looking for doesn't exist or has been removed.</p>
          <Link to="/marketplace">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Browse Beats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Beat Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{beat.title}</h1>
                    <Link 
                      to={`/profile/${beat.producer_name}`}
                      className="text-lg text-purple-600 hover:text-purple-700 font-medium"
                    >
                      by {beat.producer_name}
                    </Link>
                    {feedbackStats && (
                      <div className="flex items-center gap-2 mt-2">
                        <StarRating
                          rating={Math.round(feedbackStats.average_rating)}
                          readonly
                          size="sm"
                          showValue
                        />
                        <span className="text-sm text-gray-500">
                          ({feedbackStats.total_ratings} {feedbackStats.total_ratings === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      ₦{beat.price.toLocaleString()}
                    </div>
                    <Button 
                      onClick={handlePurchase}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {user ? 'Buy Now' : 'Sign in to Purchase'}
                    </Button>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div>
                        <div className="font-medium">Preview</div>
                        <div className="text-sm text-gray-500">30 seconds</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        onClick={handleLike}
                        className={`flex items-center space-x-1 ${
                          beat.is_liked ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${beat.is_liked ? 'fill-current' : ''}`} />
                        <span>{beat.likes_count}</span>
                      </Button>
                      <Button variant="ghost" className="text-gray-500">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                {/* Beat Info */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{beat.bpm || 'N/A'}</div>
                    <div className="text-sm text-gray-500">BPM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{beat.key || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Key</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{beat.likes_count}</div>
                    <div className="text-sm text-gray-500">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{beat.plays_count}</div>
                    <div className="text-sm text-gray-500">Plays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {feedbackStats ? feedbackStats.average_rating.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {beat.genre && (
                    <Badge className="bg-purple-100 text-purple-800">
                      {beat.genre}
                    </Badge>
                  )}
                  {beat.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {beat.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{beat.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Comments</h3>
                
                {/* Add Comment */}
                {user && (
                  <form onSubmit={handleComment} className="mb-6">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">Reviews & Ratings</h3>
                  {user && !showFeedbackForm && (
                    <Button
                      onClick={() => setShowFeedbackForm(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Write a Review
                    </Button>
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
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Producer Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Producer</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={beat.producer_picture || 'https://via.placeholder.com/60'}
                    alt={beat.producer_name}
                    className="w-15 h-15 rounded-full"
                  />
                  <div>
                    <Link 
                      to={`/profile/${beat.producer_name}`}
                      className="font-medium text-purple-600 hover:text-purple-700"
                    >
                      {beat.producer_name}
                    </Link>
                    <div className="text-sm text-gray-500">Producer</div>
                  </div>
                </div>
                <Link to={`/profile/${beat.producer_name}`}>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Purchase Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Purchase Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Beat Price</span>
                    <span className="font-medium">₦{beat.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee (5%)</span>
                    <span className="font-medium">₦{(beat.price * 0.05).toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₦{beat.price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>Instant download after purchase</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Music className="h-4 w-4" />
                    <span>Full quality WAV/MP3 files</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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