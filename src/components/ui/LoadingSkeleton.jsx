import React from 'react';

export const SkeletonCard = () => (
  <div className="glass-card p-6 h-full flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full skeleton"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 skeleton"></div>
        <div className="h-3 w-1/2 skeleton opacity-70"></div>
      </div>
    </div>
    <div className="flex-1 space-y-3 mt-4">
      <div className="h-3 w-full skeleton"></div>
      <div className="h-3 w-5/6 skeleton"></div>
      <div className="h-3 w-4/6 skeleton"></div>
    </div>
  </div>
);

export const SkeletonKPI = () => (
  <div className="glass-card p-5 h-[140px] flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-full skeleton"></div>
      <div className="w-16 h-5 rounded-full skeleton opacity-50"></div>
    </div>
    <div className="space-y-2 mt-4">
      <div className="h-7 w-1/2 skeleton"></div>
      <div className="h-3 w-3/4 skeleton opacity-60"></div>
    </div>
  </div>
);

export const SkeletonChart = () => (
  <div className="glass-card p-6 h-[400px] flex flex-col gap-6">
    <div className="flex justify-between items-center">
      <div className="h-6 w-1/3 skeleton"></div>
      <div className="h-8 w-24 rounded-lg skeleton"></div>
    </div>
    <div className="flex-1 rounded-xl skeleton opacity-50"></div>
  </div>
);

export const SkeletonTable = () => (
  <div className="glass-card rounded-2xl overflow-hidden">
    <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between">
      <div className="w-64 h-10 rounded-lg skeleton"></div>
      <div className="w-32 h-10 rounded-lg skeleton"></div>
    </div>
    <div className="w-full">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 flex-1 skeleton"></div>)}
      </div>
      {/* Rows */}
      {[1, 2, 3, 4, 5].map(row => (
        <div key={row} className="flex gap-4 p-4 border-b border-slate-200 dark:border-white/5">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-3 flex-1 skeleton opacity-60"></div>)}
        </div>
      ))}
    </div>
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Top summary skeleton */}
      <div className="flex gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="w-24 h-8 rounded-full skeleton opacity-70"></div>)}
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map(i => <SkeletonKPI key={i} />)}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => <SkeletonChart key={i} />)}
      </div>

      {/* Table */}
      <SkeletonTable />
    </div>
  );
};

export default DashboardSkeleton;
