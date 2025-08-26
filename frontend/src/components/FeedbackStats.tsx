import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import StarRating from './StarRating';
import { FeedbackStats as FeedbackStatsType } from '../types';

interface FeedbackStatsProps {
  stats: FeedbackStatsType;
  className?: string;
}

export default function FeedbackStats({ stats, className = '' }: FeedbackStatsProps) {
  const getRatingPercentage = (rating: number) => {
    if (stats.total_ratings === 0) return 0;
    return (stats.rating_distribution[rating] / stats.total_ratings) * 100;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Rating Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {stats.average_rating.toFixed(1)}
            </div>
            <StarRating
              rating={Math.round(stats.average_rating)}
              readonly
              size="sm"
            />
            <div className="text-sm text-gray-500 mt-1">
              {stats.total_ratings} {stats.total_ratings === 1 ? 'review' : 'reviews'}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-4">{rating}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">
                  {stats.rating_distribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 