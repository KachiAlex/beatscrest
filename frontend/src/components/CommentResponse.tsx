import React from 'react';
import { Badge } from './ui/badge';
import { CheckCircle } from 'lucide-react';
import { CommentResponse as CommentResponseType } from '../types';

interface CommentResponseProps {
  response: CommentResponseType;
}

export default function CommentResponse({ response }: CommentResponseProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ml-12 mt-3 p-3 bg-gray-50 rounded-lg border-l-2 border-purple-200">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <img
            src={response.profile_picture || 'https://via.placeholder.com/32'}
            alt={response.username || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">
              {response.username || 'Anonymous'}
            </span>
            {response.is_producer && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Producer
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {formatDate(response.created_at)}
            </span>
          </div>
          
          <p className="text-gray-700 text-sm leading-relaxed">
            {response.content}
          </p>
        </div>
      </div>
    </div>
  );
} 