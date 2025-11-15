import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Play, Heart, ShoppingCart, Music } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Beat } from '../types';
import apiService from '../services/api';

export default function Marketplace() {
  const navigate = useNavigate();
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
    <div className="min-h-screen pt-20">
      <div className="section-container">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Beat <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover and purchase amazing beats from talented producers worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card-elevated mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search beats, producers..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="input-field"
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
                className="input-field"
              />
            </div>

            {/* Max Price */}
            <div>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input-field"
              />
            </div>

            {/* BPM */}
            <div>
              <input
                type="number"
                placeholder="BPM"
                value={filters.bpm}
                onChange={(e) => handleFilterChange('bpm', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Beats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : beats.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No beats found</h3>
            <p className="text-slate-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {beats.map((beat, idx) => (
              <Link key={beat.id} to={`/beat/${beat.id}`} className="beat-card group animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                {/* Beat Thumbnail */}
                <div className="relative aspect-square bg-gradient-to-br from-blue-100 via-teal-100 to-orange-100 overflow-hidden rounded-t-2xl">
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
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-6 h-6 text-blue-600 fill-blue-600 ml-1" />
                    </div>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      ₦{beat.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Beat Info */}
                <div className="p-6 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 truncate mb-1">{beat.title}</h3>
                    <p className="text-sm text-slate-600 truncate">{beat.producer_name || 'Unknown Producer'}</p>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {beat.genre && (
                      <span className="badge-primary text-xs">{beat.genre}</span>
                    )}
                    {beat.bpm && (
                      <span className="badge bg-slate-100 text-slate-700 text-xs">{beat.bpm} BPM</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Heart className={`w-4 h-4 ${beat.is_liked ? 'fill-red-500 text-red-500' : ''}`} />
                      {beat.likes_count || 0}
                    </span>
                    <span>{beat.plays_count || 0} plays</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLike(beat.id);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        beat.is_liked 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${beat.is_liked ? 'fill-current' : ''}`} />
                    </Button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/beat/${beat.id}`);
                      }}
                      className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Buy Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 