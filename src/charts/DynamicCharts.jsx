import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity, Maximize2 } from 'lucide-react';
import clsx from 'clsx';

const CHART_COLORS = [
  '#8b5cf6', // primary-500
  '#06b6d4', // accent-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // rose-500
  '#3b82f6', // blue-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card bg-slate-900/90 dark:bg-slate-800/90 border-slate-700 p-3 shadow-2xl rounded-xl max-w-xs text-white">
        <p className="text-sm font-semibold mb-2 text-slate-200 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex flex-col gap-1 my-1">
            <span className="text-xs text-slate-400">{entry.name || entry.dataKey}</span>
            <span className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {typeof entry.value === 'number' && entry.value % 1 !== 0 
                ? new Intl.NumberFormat('vi-VN').format(entry.value.toFixed(2))
                : new Intl.NumberFormat('vi-VN').format(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DynamicCharts = ({ chartSuggestions }) => {
  if (!chartSuggestions || chartSuggestions.length === 0) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
        <Activity size={48} className="text-slate-300 mb-4" />
        <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-300">Chưa có biểu đồ phù hợp</h3>
        <p className="text-slate-500 max-w-md">Dữ liệu hiện tại không đủ đặc trưng (không có cột số, ngày tháng hoặc danh mục phù hợp) để hệ thống tự động sinh biểu đồ.</p>
      </div>
    );
  }

  const renderChart = (suggestion) => {
    const { type, config } = suggestion;
    const { data, xKey, yKey, colors } = config;
    const primaryColor = (colors && colors[0]) || CHART_COLORS[0];

    // Common axis styling for dark mode compatibility
    const axisStyle = {
      tick: { fill: '#94a3b8', fontSize: 12 },
      axisLine: false,
      tickLine: false,
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey={xKey} {...axisStyle} dy={10} />
              <YAxis {...axisStyle} dx={-10} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }} />
              <Bar dataKey={yKey} fill={primaryColor} radius={[6, 6, 0, 0]} maxBarSize={60}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey={xKey} {...axisStyle} dy={10} />
              <YAxis {...axisStyle} dx={-10} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={yKey} stroke={primaryColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id={`colorUv-${primaryColor}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey={xKey} {...axisStyle} dy={10} />
              <YAxis {...axisStyle} dx={-10} tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey={yKey} stroke={primaryColor} strokeWidth={3} fillOpacity={1} fill={`url(#colorUv-${primaryColor})`} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey={yKey}
                nameKey={xKey}
                paddingAngle={5}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis type="number" dataKey={xKey} name={xKey} {...axisStyle} />
              <YAxis type="number" dataKey={yKey} name={yKey} {...axisStyle} />
              <ZAxis type="number" range={[60, 400]} />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Data" data={data} fill={primaryColor} opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'bar': return <BarChart3 size={18} />;
      case 'line': return <LineChartIcon size={18} />;
      case 'pie': return <PieChartIcon size={18} />;
      case 'area': return <Activity size={18} />;
      default: return <Activity size={18} />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {chartSuggestions.map((suggestion, index) => (
        <motion.div
          key={suggestion.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.15, duration: 0.5 }}
          className="glass-card flex flex-col h-[450px] overflow-hidden group"
        >
          {/* Chart Header */}
          <div className="p-5 border-b border-slate-200 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500">
                  {getIconForType(suggestion.type)}
                </span>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{suggestion.title}</h3>
              </div>
              <p className="text-sm text-slate-500">{suggestion.description}</p>
            </div>
            
            <button className="p-2 text-slate-400 hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <Maximize2 size={16} />
            </button>
          </div>
          
          {/* Chart Area */}
          <div className="flex-1 p-4 bg-white dark:bg-slate-900 relative">
            {renderChart(suggestion)}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DynamicCharts;
