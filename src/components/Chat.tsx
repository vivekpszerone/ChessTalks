import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, LogOut, Crown, Bot, User, Loader2, AlertCircle, Trash2, Mic, Paperclip, Trophy, Calendar, Star } from 'lucide-react';
import { MessageRenderer } from './MessageRenderer';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SuggestionCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  query: string;
}

export const Chat: React.FC = () => {
  const { user, signOut, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionCards: SuggestionCard[] = [
    {
      icon: <Trophy className="h-5 w-5 text-blue-400" />,
      title: "Tournament Analysis",
      description: "Get insights on recent chess tournaments and upcoming events",
      query: "Show me the latest chess tournament results and upcoming major tournaments"
    },
    {
      icon: <Star className="h-5 w-5 text-green-400" />,
      title: "Player Rankings",
      description: "Check current FIDE ratings and player statistics",
      query: "What are the current top 10 chess player rankings?"
    },
    {
      icon: <Calendar className="h-5 w-5 text-purple-400" />,
      title: "Chess Calendar",
      description: "Find upcoming chess events and tournament schedules",
      query: "What chess tournaments are happening this month?"
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
  };

  const handleSuggestionClick = (query: string) => {
    setInputMessage(query);
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
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText || 'I received your message but couldn\'t generate a proper response.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ChessTalks</h1>
              <p className="text-sm text-gray-400">Your Chess AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Welcome, {user?.email}</span>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center space-x-2 text-red-300">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Chess insights{' '}
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  in seconds
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                ChessTalks is your AI assistant for tournaments, player ratings, upcoming events, and more
              </p>
            </div>

            {/* Search Input */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={sendMessage} className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={loading}
                    placeholder="Ask anything..."
                    className="w-full px-6 py-4 pr-24 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-lg"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Add attachment"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !inputMessage.trim()}
                      className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <Send className="h-5 w-5 text-white" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Voice input"
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Suggestion Cards */}
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {suggestionCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(card.query)}
                  className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-800/50 hover:border-gray-600 transition-all duration-200 text-left group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 p-2 bg-gray-700/50 rounded-lg group-hover:bg-gray-700 transition-colors">
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-2xl px-6 py-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/50 text-white border border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {message.sender === 'user' ? (
                        <User className="h-5 w-5 mt-0.5" />
                      ) : (
                        <Crown className="h-5 w-5 mt-0.5 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {message.sender === 'bot' ? (
                        <MessageRenderer content={message.content} />
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      <p className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-6 py-4 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Crown className="h-5 w-5 text-blue-400" />
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing chess data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

            {/* Input Form for Chat Mode */}
            <div className="sticky bottom-0 pt-4">
              <form onSubmit={sendMessage} className="relative max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={loading}
                    placeholder="Ask about tournaments, ratings, players..."
                    className="w-full px-6 py-4 pr-16 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMessage.trim()}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Send className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};