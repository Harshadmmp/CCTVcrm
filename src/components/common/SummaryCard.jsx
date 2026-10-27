import React from 'react';

export const SummaryCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = 'blue',
  onClick,
  active = false,
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50/50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      activeRing: 'ring-2 ring-blue-500',
    },
    amber: {
      bg: 'bg-amber-50/50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      activeRing: 'ring-2 ring-amber-500',
    },
    purple: {
      bg: 'bg-purple-50/50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      activeRing: 'ring-2 ring-purple-500',
    },
    emerald: {
      bg: 'bg-emerald-50/50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500',
    },
    indigo: {
      bg: 'bg-indigo-50/50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      activeRing: 'ring-2 ring-indigo-500',
    },
    slate: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-200',
      activeRing: 'ring-2 ring-slate-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
      } ${active ? style.activeRing : ''}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div className={`p-2 rounded-lg ${style.bg} ${style.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </p>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SummaryCard;

