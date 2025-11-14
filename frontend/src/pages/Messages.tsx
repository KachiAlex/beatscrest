import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import apiService from '../services/api';
import { MessageSquare as MessageIcon, Send, Search, User } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  username?: string;
  profile_picture?: string;
}

interface Conversation {
  other_user_id: string;
  username: string;
  profile_picture?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export default function Messages() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { socket, isConnected } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation, user]);

  // Set up socket listeners for real-time messages
  useEffect(() => {
    if (socket && user) {
      // Listen for new messages
      socket.on('message', (data: Message) => {
        // If this message is for the currently selected conversation, add it
        if (selectedConversation && 
            (data.sender_id === selectedConversation || data.recipient_id === selectedConversation)) {
          setMessages(prev => [...prev, data]);
          scrollToBottom();
        }
        
        // Update conversations list
        loadConversations();
      });

      // Listen for message read receipts
      socket.on('message_read', (data: { messageId: string }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.messageId ? { ...msg, is_read: true } : msg
          )
        );
      });

      return () => {
        socket.off('message');
        socket.off('message_read');
      };
    }
  }, [socket, user, selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      setLoading(true);
      const data = await apiService.getConversation(userId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const data = await apiService.sendMessage(selectedConversation, messageText.trim());
      
      // Add message to local state immediately for instant UI feedback
      const newMessage: Message = {
        id: data.data?.id || `temp-${Date.now()}`,
        sender_id: user!.id.toString(),
        recipient_id: selectedConversation,
        content: messageText.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
        username: user!.username,
        profile_picture: user!.profile_picture || undefined
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      
      // Emit message via socket for real-time delivery
      if (socket) {
        socket.emit('send_message', {
          recipientId: selectedConversation,
          content: messageText.trim()
        });
      }
      
      // Refresh conversations to update last message
      loadConversations();
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.other_user_id === selectedConversation);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MessageIcon className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-200px)] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.other_user_id}
                    onClick={() => setSelectedConversation(conversation.other_user_id)}
                    className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.other_user_id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {conversation.profile_picture ? (
                          <img
                            src={conversation.profile_picture}
                            alt={conversation.username}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.username}
                          </p>
                          {conversation.last_message_time && (
                            <p className="text-xs text-gray-500 ml-2">
                              {formatTime(conversation.last_message_time)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.last_message || 'No messages yet'}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="ml-2 bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    {selectedConv?.profile_picture ? (
                      <img
                        src={selectedConv.profile_picture}
                        alt={selectedConv.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedConv?.username}</p>
                      <p className="text-xs text-gray-500">
                        {isConnected ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user.id.toString();
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={sending || !isConnected}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending || !isConnected}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>{sending ? 'Sending...' : 'Send'}</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

