import React from 'react';
import { Smile, Frown, Meh } from 'lucide-react';

interface SentimentAnalysisProps {
  data: Record<string, { positive: number; negative: number; neutral: number }>;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ data }) => {
  const totalSentiments = Object.values(data).reduce(
    (acc, curr) => ({
      positive: acc.positive + curr.positive,
      negative: acc.negative + curr.negative,
      neutral: acc.neutral + curr.neutral,
    }),
    { positive: 0, negative: 0, neutral: 0 }
  );

  const total = totalSentiments.positive + totalSentiments.negative + totalSentiments.neutral;

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Sentiment Analysis</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smile className="w-6 h-6 text-green-400" />
            <span className="text-gray-300">Positive</span>
          </div>
          <span className="text-green-400 font-semibold">
            {total ? Math.round((totalSentiments.positive / total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${total ? (totalSentiments.positive / total) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Meh className="w-6 h-6 text-gray-400" />
            <span className="text-gray-300">Neutral</span>
          </div>
          <span className="text-gray-400 font-semibold">
            {total ? Math.round((totalSentiments.neutral / total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gray-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${total ? (totalSentiments.neutral / total) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Frown className="w-6 h-6 text-red-400" />
            <span className="text-gray-300">Negative</span>
          </div>
          <span className="text-red-400 font-semibold">
            {total ? Math.round((totalSentiments.negative / total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${total ? (totalSentiments.negative / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          <strong>Total messages analyzed:</strong> {total.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default SentimentAnalysis;