import React from 'react';
import { Trophy, Calendar, Star, Users, Target, Crown, Award, TrendingUp, ExternalLink } from 'lucide-react';

interface MessageRendererProps {
  content: string;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ content }) => {
  // Function to detect and render links
  const renderTextWithLinks = (text: string) => {
    // Regular expression to match URLs
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
            className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-600/50 dark:decoration-blue-400/50 hover:decoration-blue-800 dark:hover:decoration-blue-300 transition-colors"
          >
            <span>{part}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Check if the message contains structured data patterns
  const renderStructuredContent = (text: string) => {
    // Handle numbered lists (tournaments, players, etc.)
    if (text.includes('1.') || text.includes('1)')) {
      const lines = text.split('\n').filter(line => line.trim());
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
        <div className="space-y-3">
          {otherContent.length > 0 && (
            <div className="space-y-2">
              {otherContent.map((line, index) => (
                <p key={index} className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                  {renderTextWithLinks(line)}
                </p>
              ))}
            </div>
          )}
          {listItems.length > 0 && (
            <div className="space-y-2">
              {listItems.map((item, index) => {
                const cleanItem = item.replace(/^\d+[\.)]\s/, '');
                const icon = getIconForContent(cleanItem);
                
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
    if (text.includes('•') || text.includes('-')) {
      const lines = text.split('\n').filter(line => line.trim());
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
        <div className="space-y-3">
          {otherContent.length > 0 && (
            <div className="space-y-2">
              {otherContent.map((line, index) => (
                <p key={index} className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                  {renderTextWithLinks(line)}
                </p>
              ))}
            </div>
          )}
          {bulletItems.length > 0 && (
            <div className="space-y-2">
              {bulletItems.map((item, index) => {
                const icon = getIconForContent(item);
                
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {icon}
                    </div>
                    <p className="text-sm leading-relaxed flex-1 text-gray-900 dark:text-gray-100">
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
    if (text.toLowerCase().includes('rating') || text.toLowerCase().includes('elo')) {
      return (
        <div className="space-y-2">
          {text.split('\n').filter(line => line.trim()).map((line, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                {renderTextWithLinks(line.trim())}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // Handle tournament information
    if (text.toLowerCase().includes('tournament') || text.toLowerCase().includes('championship')) {
      return (
        <div className="space-y-2">
          {text.split('\n').filter(line => line.trim()).map((line, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                {renderTextWithLinks(line.trim())}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // Default paragraph rendering with line breaks and links
    return (
      <div className="space-y-2">
        {text.split('\n').filter(line => line.trim()).map((line, index) => (
          <p key={index} className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
            {renderTextWithLinks(line.trim())}
          </p>
        ))}
      </div>
    );
  };

  const getIconForContent = (content: string): React.ReactNode => {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('tournament') || lowerContent.includes('championship')) {
      return <Trophy className="h-4 w-4 text-amber-500" />;
    }
    if (lowerContent.includes('rating') || lowerContent.includes('elo')) {
      return <Star className="h-4 w-4 text-yellow-500" />;
    }
    if (lowerContent.includes('player') || lowerContent.includes('grandmaster') || lowerContent.includes('master')) {
      return <Crown className="h-4 w-4 text-purple-500" />;
    }
    if (lowerContent.includes('date') || lowerContent.includes('schedule') || lowerContent.includes('upcoming')) {
      return <Calendar className="h-4 w-4 text-blue-500" />;
    }
    if (lowerContent.includes('winner') || lowerContent.includes('champion') || lowerContent.includes('victory')) {
      return <Award className="h-4 w-4 text-green-500" />;
    }
    if (lowerContent.includes('rank') || lowerContent.includes('position') || lowerContent.includes('standing')) {
      return <TrendingUp className="h-4 w-4 text-indigo-500" />;
    }
    if (lowerContent.includes('team') || lowerContent.includes('club') || lowerContent.includes('organization')) {
      return <Users className="h-4 w-4 text-cyan-500" />;
    }
    
    return <Target className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="prose prose-sm max-w-none">
      {renderStructuredContent(content)}
    </div>
  );
};