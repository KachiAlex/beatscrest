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
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <header className="glass border-b border-slate-200/50 sticky top-20 z-40">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500">
                <MessageIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
                <p className="text-sm text-slate-600">Connect with producers and buyers</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100">
              <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-slate-700">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="section-container py-6">
        <div className="card-elevated overflow-hidden h-[calc(100vh-280px)] flex">
          {/* Conversations List */}
          <div className="w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Search */}
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loading && conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="text-slate-600 font-medium">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                  {!searchQuery && (
                    <p className="text-sm text-slate-500 mt-1">Start a conversation with someone!</p>
                  )}
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.other_user_id}
                    onClick={() => setSelectedConversation(conversation.other_user_id)}
                    className={`w-full p-4 border-b border-slate-200 hover:bg-white transition-all duration-200 text-left ${
                      selectedConversation === conversation.other_user_id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 relative">
                        {conversation.profile_picture ? (
                          <img
                            src={conversation.profile_picture}
                            alt={conversation.username}
                            className="h-12 w-12 rounded-full object-cover border-2 border-slate-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center border-2 border-slate-200">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        )}
                        {isConnected && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {conversation.username}
                          </p>
                          {conversation.last_message_time && (
                            <p className="text-xs text-slate-500 ml-2 whitespace-nowrap">
                              {formatTime(conversation.last_message_time)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-slate-600 truncate">
                            {conversation.last_message || 'No messages yet'}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
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
          <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    {selectedConv?.profile_picture ? (
                      <img
                        src={selectedConv.profile_picture}
                        alt={selectedConv.username}
                        className="h-11 w-11 rounded-full object-cover border-2 border-blue-200"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center border-2 border-blue-200">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedConv?.username}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                        {isConnected ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-slate-500 mt-12">
                      <div className="text-5xl mb-3">💬</div>
                      <p className="font-semibold text-lg mb-1">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender_id === user.id.toString();
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-2xl px-4 py-2.5 shadow-md ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                                : 'bg-white text-slate-900 border border-slate-200'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p className={`text-xs mt-1.5 ${
                                isOwnMessage ? 'text-blue-100' : 'text-slate-500'
                              }`}>
                                {formatTime(message.created_at)}
                                {isOwnMessage && !message.is_read && (
                                  <span className="ml-1">• Unread</span>
                                )}
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
                <div className="p-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 input-field"
                      disabled={sending || !isConnected}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending || !isConnected}
                      className="btn-primary px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center animate-fade-in">
                  <div className="p-6 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <MessageIcon className="h-12 w-12 text-blue-600" />
                  </div>
                  <p className="text-xl font-semibold text-slate-900 mb-2">Select a conversation</p>
                  <p className="text-slate-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

