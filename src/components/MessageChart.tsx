import React from 'react';

interface MessageChartProps {
  data: Record<string, number>;
  title: string;
}

const MessageChart: React.FC<MessageChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...Object.values(data));
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
      
      <div className="space-y-4">
        {Object.entries(data).map(([user, count], index) => {
          const percentage = (count / maxValue) * 100;
          const color = colors[index % colors.length];
          
          return (
            <div key={user} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium truncate">{user}</span>
                <span className="text-gray-400 text-sm">{count} msgs</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MessageChart;