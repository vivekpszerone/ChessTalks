import React from 'react';
import { Trophy, Calendar, Star, Users, Target, Crown, Award, TrendingUp, ExternalLink } from 'lucide-react';

interface MessageRendererProps {
  content: string;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content }) => {
  // Function to detect and render links
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors"
          >
            <span>{part}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Enhanced text processing with emojis and formatting
  const processText = (text: string) => {
    // Add emojis for chess-related terms
    let processedText = text
      .replace(/\b(chess|Chess)\b/g, '♟️ Chess')
      .replace(/\b(tournament|Tournament)\b/g, '🏆 Tournament')
      .replace(/\b(rating|Rating|FIDE)\b/g, '📊 Rating')
      .replace(/\b(grandmaster|Grandmaster|GM)\b/g, '👑 Grandmaster')
      .replace(/\b(world champion|World Champion)\b/g, '🌟 World Champion')
      .replace(/\b(game|Game)\b/g, '⚔️ Game');

    // Bold important terms (player names, tournament names)
    processedText = processedText
      .replace(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, '**$1**') // Names like "Magnus Carlsen"
      .replace(/\b(Candidates Tournament|World Championship|Chess Olympiad|Grand Prix)\b/g, '**$1**');

    return processedText;
  };

  // Check if the message contains structured data patterns
  const renderStructuredContent = (text: string) => {
    const processedText = processText(text);

    // Handle numbered lists (tournaments, players, etc.)
    if (processedText.includes('1.') || processedText.includes('1)')) {
      const lines = processedText.split('\n').filter(line => line.trim());
      const listItems: string[] = [];
      const otherContent: string[] = [];
      
      lines.forEach(line => {
        if (/^\d+[\.)]\s/.test(line.trim())) {
          listItems.push(line.trim());
        } else if (line.trim()) {
          otherContent.push(line.trim());
        }
      });

      return (
        <div className="space-y-4">
          {otherContent.length > 0 && (
            <div className="space-y-3">
              {otherContent.map((line, index) => (
                <p key={index} className="text-gray-200 leading-relaxed">
                  {renderTextWithLinks(line)}
                </p>
              ))}
            </div>
          )}
          {listItems.length > 0 && (
            <div className="space-y-3">
              {listItems.map((item, index) => {
                const cleanItem = item.replace(/^\d+[\.)]\s/, '');
                const icon = getIconForContent(cleanItem);
                
                return (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex-shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 leading-relaxed">
                        {renderTextWithLinks(cleanItem)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Handle bullet points
    if (processedText.includes('•') || processedText.includes('-')) {
      const lines = processedText.split('\n').filter(line => line.trim());
      const bulletItems: string[] = [];
      const otherContent: string[] = [];
      
      lines.forEach(line => {
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          bulletItems.push(line.trim().replace(/^[•-]\s*/, ''));
        } else if (line.trim()) {
          otherContent.push(line.trim());
        }
      });

      return (
        <div className="space-y-4">
          {otherContent.length > 0 && (
            <div className="space-y-3">
              {otherContent.map((line, index) => (
                <p key={index} className="text-gray-200 leading-relaxed">
                  {renderTextWithLinks(line)}
                </p>
              ))}
            </div>
          )}
          {bulletItems.length > 0 && (
            <div className="space-y-3">
              {bulletItems.map((item, index) => {
                const icon = getIconForContent(item);
                
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {icon}
                    </div>
                    <p className="text-gray-200 leading-relaxed flex-1">
                      {renderTextWithLinks(item)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Handle rating information
    if (processedText.toLowerCase().includes('rating') || processedText.toLowerCase().includes('elo')) {
      return (
        <div className="space-y-3">
          {processedText.split('\n').filter(line => line.trim()).map((line, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <p className="text-gray-200 leading-relaxed">
                {renderTextWithLinks(line.trim())}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // Handle tournament information
    if (processedText.toLowerCase().includes('tournament') || processedText.toLowerCase().includes('championship')) {
      return (
        <div className="space-y-3">
          {processedText.split('\n').filter(line => line.trim()).map((line, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <p className="text-gray-200 leading-relaxed">
                {renderTextWithLinks(line.trim())}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // Default paragraph rendering with line breaks and links
    return (
      <div className="space-y-3">
        {processedText.split('\n').filter(line => line.trim()).map((line, index) => (
          <p key={index} className="text-gray-200 leading-relaxed">
            {renderTextWithLinks(line.trim())}
          </p>
        ))}
      </div>
    );
  };

  const getIconForContent = (content: string): React.ReactNode => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('tournament') || lowerContent.includes('championship')) {
      return <Trophy className="h-4 w-4 text-amber-400" />;
    }
    if (lowerContent.includes('rating') || lowerContent.includes('elo')) {
      return <Star className="h-4 w-4 text-yellow-400" />;
    }
    if (lowerContent.includes('player') || lowerContent.includes('grandmaster') || lowerContent.includes('master')) {
      return <Crown className="h-4 w-4 text-purple-400" />;
    }
    if (lowerContent.includes('date') || lowerContent.includes('schedule') || lowerContent.includes('upcoming')) {
      return <Calendar className="h-4 w-4 text-blue-400" />;
    }
    if (lowerContent.includes('winner') || lowerContent.includes('champion') || lowerContent.includes('victory')) {
      return <Award className="h-4 w-4 text-green-400" />;
    }
    if (lowerContent.includes('rank') || lowerContent.includes('position') || lowerContent.includes('standing')) {
      return <TrendingUp className="h-4 w-4 text-indigo-400" />;
    }
    if (lowerContent.includes('team') || lowerContent.includes('club') || lowerContent.includes('organization')) {
      return <Users className="h-4 w-4 text-cyan-400" />;
    }
    
    return <Target className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="prose prose-invert max-w-none">
      {renderStructuredContent(content)}
    </div>
  );
};