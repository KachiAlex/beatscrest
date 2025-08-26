import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, MessageCircle, Send } from 'lucide-react';
import { Comment as CommentType, CommentResponse as CommentResponseType } from '../types';
import CommentResponse from './CommentResponse';

interface CommentItemProps {
  comment: CommentType;
  currentUserId?: number;
  isProducer?: boolean;
  onAddResponse: (commentId: number, content: string) => Promise<void>;
}

export default function CommentItem({ 
  comment, 
  currentUserId, 
  isProducer = false,
  onAddResponse 
}: CommentItemProps) {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseContent, setResponseContent] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseContent.trim()) return;

    try {
      setSubmittingResponse(true);
      await onAddResponse(comment.id, responseContent.trim());
      setResponseContent('');
      setShowResponseForm(false);
    } catch (error) {
      console.error('Error adding response:', error);
    } finally {
      setSubmittingResponse(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <img
          src={comment.profile_picture || 'https://via.placeholder.com/40'}
          alt={comment.username || 'User'}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium">{comment.username}</span>
            {comment.is_producer && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Producer
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-gray-700">{comment.content}</p>
          
          {/* Response Button - Only show for producers */}
          {isProducer && !comment.is_producer && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResponseForm(!showResponseForm)}
                className="text-purple-600 hover:text-purple-700 p-0 h-auto"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Reply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Response Form */}
      {showResponseForm && isProducer && (
        <form onSubmit={handleSubmitResponse} className="ml-12">
          <div className="flex space-x-2">
            <input
              type="text"
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              placeholder="Write a response..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              disabled={submittingResponse}
            />
            <Button 
              type="submit" 
              disabled={!responseContent.trim() || submittingResponse}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submittingResponse ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Responses */}
      {comment.responses && comment.responses.length > 0 && (
        <div className="space-y-2">
          {comment.responses.map((response) => (
            <CommentResponse key={response.id} response={response} />
          ))}
        </div>
      )}
    </div>
  );
} 