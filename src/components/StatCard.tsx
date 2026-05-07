import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  subtitle?: string;
}

const colorVariants = {
  blue: {
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-500',
    text: 'text-white'
  },
  green: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-500',
    text: 'text-white'
  },
  yellow: {
    gradient: 'from-yellow-400 to-orange-500',
    bg: 'bg-yellow-400',
    text: 'text-white'
  },
  red: {
    gradient: 'from-pink-500 to-red-600',
    bg: 'bg-pink-500',
    text: 'text-white'
  },
  purple: {
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-500',
    text: 'text-white'
  }
};

export function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const colors = colorVariants[color];

  return (
    <div className={`bg-gradient-to-br ${colors.gradient} rounded-xl shadow-lg p-4 sm:p-6 text-white hover:shadow-2xl transition-all transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-medium opacity-90">{title}</h3>
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 truncate">{value}</div>
      {subtitle && (
        <div className="text-xs sm:text-sm opacity-80">{subtitle}</div>
      )}
      <button className={`mt-3 sm:mt-4 px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-xs sm:text-sm font-medium transition w-full text-left flex items-center justify-between`}>
        <span>Plus d'infos</span>
        <span>→</span>
      </button>
    </div>
  );
}
