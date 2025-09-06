import React from 'react';

interface ActivityHeatmapProps {
  data: Record<number, number>;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  const maxValue = Math.max(...Object.values(data));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-6">Activity by Hour</h3>
      
      <div className="grid grid-cols-12 gap-2">
        {hours.map((hour) => {
          const count = data[hour] || 0;
          const intensity = count / maxValue;
          const opacity = Math.max(0.1, intensity);
          
          return (
            <div
              key={hour}
              className="aspect-square rounded-lg bg-green-500 flex items-center justify-center text-xs text-white font-medium hover:scale-110 transition-transform cursor-default"
              style={{ opacity }}
              title={`${hour}:00 - ${count} messages`}
            >
              {hour}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between text-xs text-gray-400">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;