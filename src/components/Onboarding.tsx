import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Star, Globe, Calendar, Trophy, BookOpen, Target, Upload, ChevronRight, Crown, Hash } from 'lucide-react';

interface OnboardingData {
  full_name: string;
  fide_id: string;
  fide_rating: string;
  chess_title: string;
  country: string;
  date_of_birth: string;
  chess_club: string;
  playing_style: string;
  favorite_opening: string;
  bio: string;
}

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: '',
    fide_id: '',
    fide_rating: '',
    chess_title: '',
    country: '',
    date_of_birth: '',
    chess_club: '',
    playing_style: '',
    favorite_opening: '',
    bio: ''
  });

  const chessTitle = [
    'GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'WFM', 'WCM', 
    'NM', 'Expert', 'Class A', 'Class B', 'Class C', 'Class D', 'Beginner'
  ];

  const playingStyles = [
    'Aggressive', 'Positional', 'Tactical', 'Endgame Specialist', 
    'Opening Specialist', 'Balanced'
  ];

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!formData.full_name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const profileData = {
        id: user?.id,
        full_name: formData.full_name.trim(),
        fide_id: formData.fide_id || null,
        fide_rating: formData.fide_rating ? parseInt(formData.fide_rating) : null,
        chess_title: formData.chess_title || null,
        country: formData.country || null,
        date_of_birth: formData.date_of_birth || null,
        chess_club: formData.chess_club || null,
        playing_style: formData.playing_style || null,
        favorite_opening: formData.favorite_opening || null,
        bio: formData.bio || null,
        onboarding_completed: true
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome to ChessTalks!</h2>
        <p className="text-gray-400">Let's set up your profile to get started</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => handleInputChange('full_name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white placeholder-gray-400"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white placeholder-gray-400"
            placeholder="e.g., United States, India, Russia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
          <Trophy className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Chess Background</h2>
        <p className="text-gray-400">Tell us about your chess experience</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            FIDE ID
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.fide_id}
              onChange={(e) => handleInputChange('fide_id', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white placeholder-gray-400"
              placeholder="e.g., 1503014"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Your official FIDE player ID (if you have one)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Rating
          </label>
          <input
            type="number"
            value={formData.fide_rating}
            onChange={(e) => handleInputChange('fide_rating', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white placeholder-gray-400"
            placeholder="e.g., 1500, 2000, 2500"
            min="0"
            max="3000"
          />
          <p className="text-xs text-gray-500 mt-1">Your current FIDE or estimated rating</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chess Title
          </label>
          <select
            value={formData.chess_title}
            onChange={(e) => handleInputChange('chess_title', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white"
          >
            <option value="">Select your title (if any)</option>
            {chessTitle.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Chess Club
          </label>
          <input
            type="text"
            value={formData.chess_club}
            onChange={(e) => handleInputChange('chess_club', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white placeholder-gray-400"
            placeholder="e.g., Local Chess Club, University Chess Team"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Playing Style
          </label>
          <select
            value={formData.playing_style}
            onChange={(e) => handleInputChange('playing_style', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white"
          >
            <option value="">Select your playing style</option>
            {playingStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Final Details</h2>
        <p className="text-gray-400">Complete your chess profile</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Favorite Opening
          </label>
          <input
            type="text"
            value={formData.favorite_opening}
            onChange={(e) => handleInputChange('favorite_opening', e.target.value)}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white placeholder-gray-400"
            placeholder="e.g., Sicilian Defense, Queen's Gambit, King's Indian"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700/50 text-white placeholder-gray-400 resize-none"
            placeholder="Tell us about your chess journey, achievements, or goals..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-700/50">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step {currentStep} of 3</span>
              <span className="text-sm text-gray-400">{Math.round((currentStep / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4" />
                    <span>Complete Setup</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};