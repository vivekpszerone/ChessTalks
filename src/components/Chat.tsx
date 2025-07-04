import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { Send, LogOut, Crown, User, Loader2, AlertCircle, Trash2, Trophy, Calendar, Star, Globe, ChevronDown, Menu, X, Settings, Search, MapPin } from 'lucide-react';
import { MessageRenderer } from './MessageRenderer';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  hasWebSearch?: boolean;
}

interface SuggestionCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  query: string;
  explanation: string;
}

interface PromptSuggestion {
  text: string;
  icon: React.ReactNode;
}

export const Chat: React.FC = () => {
  const { user, signOut, session } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionCards: SuggestionCard[] = [
    {
      icon: <Calendar className="h-5 w-5 text-blue-400" />,
      title: "🗓️ Tournament History",
      description: "Explore past tournaments, results, and player performances",
      query: "Show me recent tournament results from the Candidates Tournament",
      explanation: "I'll search for recent tournament data, results, and player performances from major chess events."
    },
    {
      icon: <Search className="h-5 w-5 text-green-400" />,
      title: "🔍 Scout a Player",
      description: "Get detailed info about any chess player's rating and games",
      query: "Who is Gukesh?",
      explanation: "I'll fetch FIDE rating, title, recent games, and career highlights for any player you're curious about."
    },
    {
      icon: <Star className="h-5 w-5 text-purple-400" />,
      title: "📅 Upcoming Events",
      description: "Find upcoming chess tournaments and events worldwide",
      query: "What chess events are coming up in Kerala?",
      explanation: "I'll search for upcoming tournaments, events, and chess activities in your region or worldwide."
    }
  ];

  const promptSuggestions: PromptSuggestion[] = [
    {
      text: "What is the FIDE rating of Magnus Carlsen?",
      icon: <Star className="h-4 w-4 text-yellow-400" />
    },
    {
      text: "What was my last tournament?",
      icon: <Trophy className="h-4 w-4 text-amber-400" />
    },
    {
      text: "Did I ever play with Carlsen?",
      icon: <Crown className="h-4 w-4 text-purple-400" />
    },
    {
      text: "What events are coming up in Kerala?",
      icon: <MapPin className="h-4 w-4 text-blue-400" />
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    setError('');
    setMobileMenuOpen(false);
  };

  const handleSuggestionClick = (query: string, explanation?: string) => {
    setInputMessage(query);
    
    if (explanation) {
      // Add explanation message immediately
      const explanationMessage: Message = {
        id: Date.now().toString(),
        content: explanation,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, explanationMessage]);
    }
  };

  const handlePromptSuggestionClick = (text: string) => {
    setInputMessage(text);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('https://vivekps143.app.n8n.cloud/webhook/a03f96ee-b037-453b-97a4-d9da4fc7dd5d', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      
      // Enhanced response formatting
      let formattedResponse = responseText || 'I received your message but couldn\'t generate a proper response.';
      
      // Add follow-up prompts based on content
      if (formattedResponse.toLowerCase().includes('not found') || formattedResponse.toLowerCase().includes('couldn\'t find')) {
        formattedResponse = "Hmm, I couldn't find that info right now — maybe try another question?\n\nWhat else can I help you with? 🤔";
      } else {
        // Add contextual follow-up based on response content
        if (formattedResponse.toLowerCase().includes('player') || formattedResponse.toLowerCase().includes('rating')) {
          formattedResponse += "\n\nWant to check another player? 🔍";
        } else if (formattedResponse.toLowerCase().includes('tournament')) {
          formattedResponse += "\n\nCurious about other tournaments? 🏆";
        } else {
          formattedResponse += "\n\nWhat else can I help you with? ♟️";
        }
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: formattedResponse,
        sender: 'bot',
        timestamp: new Date(),
        hasWebSearch: true,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.\n\nWhat else can I help you with? 🤔',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const getWelcomeMessage = () => {
    if (profile?.full_name) {
      return `Welcome back, ${profile.full_name}! ♟️`;
    }
    return 'Welcome to ChessTalks! ♟️';
  };

  const getSubtitle = () => {
    if (profile?.fide_rating) {
      return `FIDE Rating: ${profile.fide_rating} • Your Chess AI Assistant`;
    }
    return 'Your Chess AI Assistant';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-white">ChessTalks</h1>
                <p className="text-xs sm:text-sm text-gray-400">Your Chess AI Assistant</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-white">ChessTalks</h1>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-300 truncate max-w-48">
                  {profile?.full_name || user?.email}
                </div>
                {profile?.chess_title && (
                  <div className="text-xs text-blue-400">{profile.chess_title}</div>
                )}
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                  title="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t border-gray-800 space-y-3">
              <div className="text-sm text-gray-300">
                {profile?.full_name || user?.email}
                {profile?.chess_title && (
                  <div className="text-xs text-blue-400">{profile.chess_title}</div>
                )}
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors text-left"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear Chat</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-6xl mx-auto p-4">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center space-x-2 text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm flex-1">{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-200 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 sm:pb-40">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight px-2">
                {getWelcomeMessage()}
              </h2>
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight px-2">
                Chess insights{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  in seconds
                </span>
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
                {getSubtitle()}
              </p>
            </div>

            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {suggestionCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(card.query, card.explanation)}
                  className="p-4 sm:p-6 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-750 hover:border-gray-600 transition-all duration-200 text-left group w-full"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600 transition-colors">
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2 text-sm sm:text-base break-words">{card.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed break-words">{card.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="space-y-6 sm:space-y-8">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {/* User Message */}
                {message.sender === 'user' && (
                  <div className="flex justify-end">
                    <div className="max-w-full sm:max-w-3xl">
                      <div className="flex items-start space-x-3 justify-end">
                        <div className="bg-gray-800 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 max-w-full break-words">
                          <p className="text-white text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bot Message */}
                {message.sender === 'bot' && (
                  <div className="flex justify-start">
                    <div className="max-w-full w-full">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Web Search Indicator */}
                          {message.hasWebSearch && (
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                              <Globe className="h-4 w-4" />
                              <span>Web Search</span>
                              <span className="text-green-400">• Result Available</span>
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          )}
                          
                          {/* Message Content */}
                          <div className="prose prose-invert max-w-none">
                            <MessageRenderer content={message.content} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing chess data... ♟️</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Prompt Suggestions - Only show when no messages */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {promptSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptSuggestionClick(suggestion.text)}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200 group max-w-full"
                >
                  {suggestion.icon}
                  <span className="truncate max-w-[200px] sm:max-w-none">
                    {window.innerWidth < 640 && suggestion.text.length > 25 
                      ? suggestion.text.substring(0, 25) + '...' 
                      : suggestion.text
                    }
                  </span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className="relative">
            <div className="relative bg-gray-800 rounded-2xl border border-gray-700 focus-within:border-gray-600">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                disabled={loading}
                placeholder="Ask anything about chess... ♟️"
                rows={1}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-16 bg-transparent border-0 focus:ring-0 focus:outline-none text-white placeholder-gray-400 resize-none text-sm sm:text-base"
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
              <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="p-2 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-gray-900" />
                  ) : (
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 text-gray-900" />
                  )}
                </button>
              </div>
            </div>
          </form>
          <p className="text-xs text-gray-500 text-center">
            ChessTalks can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
};