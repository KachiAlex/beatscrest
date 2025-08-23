import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Play, Heart, ShoppingCart, Music } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Beat } from '../types';
import apiService from '../services/api';

export default function Marketplace() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    minPrice: '',
    maxPrice: '',
    bpm: ''
  });

  useEffect(() => {
    loadBeats();
  }, [filters]);

  const loadBeats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBeats({
        search: filters.search || undefined,
        genre: filters.genre || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        bpm: filters.bpm ? parseInt(filters.bpm) : undefined,
        limit: 20
      });
      setBeats(response.beats);
    } catch (error) {
      console.error('Error loading beats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLike = async (beatId: number) => {
    try {
      await apiService.likeBeat(beatId);
      // Update the beat's like status in the local state
      setBeats(prev => prev.map(beat => 
        beat.id === beatId 
          ? { ...beat, is_liked: !beat.is_liked, likes_count: beat.is_liked ? beat.likes_count - 1 : beat.likes_count + 1 }
          : beat
      ));
    } catch (error) {
      console.error('Error liking beat:', error);
    }
  };

  const genres = ['Hip Hop', 'R&B', 'Afrobeats', 'Pop', 'Trap', 'Drill', 'Amapiano', 'Gospel', 'Jazz', 'Electronic'];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Beat Marketplace</h1>
          <p className="text-lg text-gray-600">Discover and purchase amazing beats from talented producers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search beats..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* BPM */}
            <div>
              <input
                type="number"
                placeholder="BPM"
                value={filters.bpm}
                onChange={(e) => handleFilterChange('bpm', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Beats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {beats.map((beat) => (
              <Card key={beat.id} className="beat-card group">
                <div className="relative">
                  {/* Beat Thumbnail */}
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
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <Button
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-purple-600 hover:bg-gray-100"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-purple-600 text-white">
                        ₦{beat.price.toLocaleString()}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Beat Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg truncate">{beat.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{beat.producer_name}</p>
                      
                      {/* Tags */}
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

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{beat.likes_count} likes</span>
                          <span>{beat.plays_count} plays</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(beat.id)}
                          className={`flex items-center space-x-1 ${
                            beat.is_liked ? 'text-red-500' : 'text-gray-500'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${beat.is_liked ? 'fill-current' : ''}`} />
                          <span>Like</span>
                        </Button>

                        <Link to={`/beat/${beat.id}`}>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Buy Now
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && beats.length === 0 && (
          <div className="text-center py-20">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No beats found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
} 