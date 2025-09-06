import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 bg-blue-500',
  green: 'from-green-500 to-green-600 bg-green-500',
  purple: 'from-purple-500 to-purple-600 bg-purple-500',
  orange: 'from-orange-500 to-orange-600 bg-orange-500',
};

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, title, value, subtitle, color }) => {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} bg-opacity-20 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
      
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatsCard;