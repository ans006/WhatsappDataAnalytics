import React from 'react';

interface WordCloudProps {
  words: Record<string, number>;
}

const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const sortedWords = Object.entries(words)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30);
  
  const maxCount = sortedWords[0]?.[1] || 1;

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Most Used Words</h3>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {sortedWords.map(([word, count], index) => {
          const size = Math.max(12, (count / maxCount) * 32);
          const colors = [
            'text-blue-400', 'text-green-400', 'text-purple-400', 
            'text-orange-400', 'text-pink-400', 'text-indigo-400'
          ];
          const color = colors[index % colors.length];
          
          return (
            <span
              key={word}
              className={`${color} font-medium hover:scale-110 transition-transform cursor-default`}
              style={{ fontSize: `${size}px` }}
              title={`${word}: ${count} times`}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default WordCloud;