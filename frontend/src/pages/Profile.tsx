import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Music, Users, Heart, Play, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User as UserType, Beat } from '../types';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
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
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <img
                  src={user.profile_picture || 'https://via.placeholder.com/120'}
                  alt={user.username}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge className="bg-purple-100 text-purple-800">
                        {user.account_type}
                      </Badge>
                      {user.is_verified && (
                        <Badge className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      )}
                    </div>
                    {user.bio && (
                      <p className="text-gray-600 mb-4 max-w-2xl">{user.bio}</p>
                    )}
                  </div>

                  {/* Follow Button */}
                  {currentUser && currentUser.id !== user.id && (
                    <Button
                      onClick={handleFollow}
                      className={`${
                        isFollowing 
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{beats.length}</div>
                    <div className="text-sm text-gray-500">Beats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.followers_count}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.following_count}</div>
                    <div className="text-sm text-gray-500">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('beats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'beats'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Music className="h-4 w-4 inline mr-2" />
                Beats
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'followers'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Followers
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'following'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Following
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'beats' && (
          <div>
            {user.account_type === 'producer' && currentUser?.id === user.id && (
              <div className="mb-6">
                <Link to="/upload">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload New Beat
                  </Button>
                </Link>
              </div>
            )}

            {beats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {beats.map((beat) => (
                  <Card key={beat.id} className="beat-card group">
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 relative overflow-hidden">
                        {beat.thumbnail_url ? (
                          <img
                            src={beat.thumbnail_url}
                            alt={beat.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="h-16 w-16 text-purple-400" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <Button
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-purple-600 hover:bg-gray-100"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="absolute top-3 right-3">
                          <Badge className="bg-purple-600 text-white">
                            ₦{beat.price.toLocaleString()}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg truncate">{beat.title}</h3>
                          
                          <div className="flex flex-wrap gap-1">
                            {beat.genre && (
                              <Badge variant="outline" className="text-xs">
                                {beat.genre}
                              </Badge>
                            )}
                            {beat.bpm && (
                              <Badge variant="outline" className="text-xs">
                                {beat.bpm} BPM
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {beat.likes_count}
                              </span>
                              <span className="flex items-center">
                                <Play className="h-3 w-3 mr-1" />
                                {beat.plays_count}
                              </span>
                            </div>
                          </div>

                          <Link to={`/beat/${beat.id}`}>
                            <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                              View Beat
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No beats yet</h3>
                <p className="text-gray-600">
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
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'followers' ? 'Followers' : 'Following'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'followers' 
                ? 'People who follow this user will appear here.'
                : 'People this user follows will appear here.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 