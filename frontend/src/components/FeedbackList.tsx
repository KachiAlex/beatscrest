import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import StarRating from './StarRating';
import { BeatFeedback } from '../types';
import { Edit, Trash2, CheckCircle } from 'lucide-react';

interface FeedbackListProps {
  feedback: BeatFeedback[];
  currentUserId?: number;
  onEdit?: (feedback: BeatFeedback) => void;
  onDelete?: (feedbackId: number) => void;
  loading?: boolean;
}

export default function FeedbackList({
  feedback,
  currentUserId,
  onEdit,
  onDelete,
  loading = false
}: FeedbackListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No reviews yet. Be the first to review this beat!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <img
                  src={item.profile_picture || 'https://via.placeholder.com/40'}
                  alt={item.username || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">
                    {item.username || 'Anonymous'}
                  </span>
                  {item.is_verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {formatDate(item.created_at)}
                  </Badge>
                </div>
                
                <div className="mb-2">
                  <StarRating
                    rating={item.rating}
                    readonly
                    size="sm"
                    showValue
                  />
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.comment}
                </p>
              </div>
              
              {currentUserId === item.user_id && (
                <div className="flex-shrink-0 flex gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 