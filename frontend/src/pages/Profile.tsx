import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Music, Users, Heart, Play, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User as UserType, Beat } from '../types';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'beats' | 'followers' | 'following'>('beats');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (username) {
      loadUserProfile();
      loadUserBeats();
    }
  }, [username]);

  const loadUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile(username!);
      setUser(response.user);
      setIsFollowing(response.user.is_following || false);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserBeats = async () => {
    try {
      const response = await apiService.getUserBeats(username!);
      setBeats(response.beats);
    } catch (error) {
      console.error('Error loading user beats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!username) return;
    
    try {
      const response = await apiService.followUser(username);
      setIsFollowing(response.following);
      if (user) {
        setUser(prev => prev ? {
          ...prev,
          followers_count: response.following ? prev.followers_count + 1 : prev.followers_count - 1
        } : null);
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="p-6 rounded-full bg-slate-100 w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">User Not Found</h2>
          <p className="text-slate-600 text-lg">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="section-container">
        {/* Profile Header */}
        <div className="card-elevated mb-10 bg-gradient-to-br from-blue-50 via-teal-50 to-orange-50 border-2 border-blue-200">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Profile Picture */}
              <div className="flex-shrink-0 relative">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.username}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-500 via-teal-500 to-orange-500 flex items-center justify-center border-4 border-white shadow-2xl">
                    <span className="text-white font-bold text-4xl">{user.username?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {user.is_verified && (
                  <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-white text-xl">✓</span>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-4xl md:text-5xl font-bold text-slate-900">{user.username}</h1>
                      <Badge className="bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 font-semibold px-3 py-1">
                        {user.account_type}
                      </Badge>
                    </div>
                    {user.bio && (
                      <p className="text-lg text-slate-600 mb-6 max-w-2xl leading-relaxed">{user.bio}</p>
                    )}
                    {/* Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold gradient-text">{beats.length}</div>
                        <div className="text-sm text-slate-600 font-medium mt-1">Beats</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold gradient-text">{user.followers_count || 0}</div>
                        <div className="text-sm text-slate-600 font-medium mt-1">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold gradient-text">{user.following_count || 0}</div>
                        <div className="text-sm text-slate-600 font-medium mt-1">Following</div>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  {currentUser && currentUser.id !== user.id && (
                    <button
                      onClick={handleFollow}
                      className={`btn-primary px-8 py-3 text-base font-semibold ${
                        isFollowing 
                          ? 'bg-slate-600 hover:bg-slate-700' 
                          : ''
                      }`}
                    >
                      {isFollowing ? '✓ Following' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-elevated mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-2 px-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('beats')}
                className={`py-3 px-6 rounded-xl font-semibold text-sm whitespace-nowrap flex items-center gap-2 transition-all duration-300 ${
                  activeTab === 'beats'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Music className="h-5 w-5" />
                Beats
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`py-3 px-6 rounded-xl font-semibold text-sm whitespace-nowrap flex items-center gap-2 transition-all duration-300 ${
                  activeTab === 'followers'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Users className="h-5 w-5" />
                Followers
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`py-3 px-6 rounded-xl font-semibold text-sm whitespace-nowrap flex items-center gap-2 transition-all duration-300 ${
                  activeTab === 'following'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Users className="h-5 w-5" />
                Following
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'beats' && (
              <div>
                {user.account_type === 'producer' && currentUser?.id === user.id && (
                  <div className="mb-8">
                    <Link to="/upload">
                      <button className="btn-primary flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Upload New Beat
                      </button>
                    </Link>
                  </div>
                )}

                {beats.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {beats.map((beat) => (
                      <Link key={beat.id} to={`/beat/${beat.id}`} className="beat-card group animate-fade-in">
                        <div className="relative">
                          <div className="aspect-square bg-gradient-to-br from-blue-100 to-teal-100 relative overflow-hidden rounded-t-2xl">
                            {beat.thumbnail_url ? (
                              <img
                                src={beat.thumbnail_url}
                                alt={beat.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="h-20 w-20 text-slate-300" />
                              </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                <Play className="w-6 h-6 text-blue-600 fill-blue-600 ml-1" />
                              </div>
                            </div>

                            <div className="absolute top-4 right-4">
                              <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                ₦{beat.price.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 space-y-3">
                            <h3 className="font-bold text-lg text-slate-900 truncate">{beat.title}</h3>
                            
                            <div className="flex flex-wrap gap-2">
                              {beat.genre && (
                                <span className="badge-primary text-xs">{beat.genre}</span>
                              )}
                              {beat.bpm && (
                                <span className="badge bg-slate-100 text-slate-700 text-xs">{beat.bpm} BPM</span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {beat.likes_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Play className="h-4 w-4" />
                                {beat.plays_count || 0}
                              </span>
                            </div>

                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/beat/${beat.id}`);
                              }}
                              className="btn-primary w-full text-sm px-4 py-2 mt-3"
                            >
                              View Beat
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎵</div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No beats yet</h3>
                    <p className="text-slate-600 text-lg">
                      {user.account_type === 'producer' 
                        ? 'Start uploading your beats to showcase your talent!'
                        : 'This user hasn\'t uploaded any beats yet.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'followers' || activeTab === 'following') && (
              <div className="text-center py-16 animate-fade-in">
                <div className="p-6 rounded-full bg-slate-100 w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Users className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {activeTab === 'followers' ? 'Followers' : 'Following'}
                </h3>
                <p className="text-slate-600 text-lg">
                  {activeTab === 'followers' 
                    ? 'People who follow this user will appear here.'
                    : 'People this user follows will appear here.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 