import React, { useMemo } from 'react';
import { RotateCcw, Download, Users, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { ChatData } from '../types';
import { generateAnalytics } from '../utils/analytics';
import StatsCard from './StatsCard';
import MessageChart from './MessageChart';
import WordCloud from './WordCloud';
import ActivityHeatmap from './ActivityHeatmap';
import SentimentAnalysis from './SentimentAnalysis';

interface DashboardProps {
  chatData: ChatData;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ chatData, onReset }) => {
  const analytics = useMemo(() => generateAnalytics(chatData), [chatData]);

  const exportData = () => {
    const exportObj = {
      chatData,
      analytics,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whatsapp-analytics.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Chat Analytics</h2>
          <p className="text-gray-400">
            {chatData.dateRange.start.toLocaleDateString()} - {chatData.dateRange.end.toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportData}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={MessageSquare}
          title="Total Messages"
          value={chatData.totalMessages.toLocaleString()}
          subtitle="messages sent"
          color="blue"
        />
        <StatsCard
          icon={Users}
          title="Participants"
          value={chatData.participants.length.toString()}
          subtitle="active users"
          color="green"
        />
        <StatsCard
          icon={TrendingUp}
          title="Avg Length"
          value={Math.round(analytics.averageMessageLength).toString()}
          subtitle="characters per message"
          color="purple"
        />
        <StatsCard
          icon={Clock}
          title="Most Active Hour"
          value={`${analytics.mostActiveHour}:00`}
          subtitle="peak activity time"
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MessageChart data={analytics.messagesByUser} title="Messages by User" />
        <ActivityHeatmap data={analytics.messagesByHour} />
      </div>

      {/* Word Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WordCloud words={analytics.wordFrequency} />
        <SentimentAnalysis data={analytics.sentimentScores} />
      </div>

      {/* Daily Activity */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Daily Activity</h3>
        <div className="h-64 flex items-end space-x-1">
          {Object.entries(analytics.messagesByDay).map(([day, count]) => {
            const height = (count / Math.max(...Object.values(analytics.messagesByDay))) * 100;
            return (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 hover:from-blue-400 hover:to-blue-300"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${day}: ${count} messages`}
                />
                <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                  {new Date(day).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;