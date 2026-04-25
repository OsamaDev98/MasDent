"use client";
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffLoading() {
  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-10 w-[250px] mb-2" />
          <Skeleton className="h-5 w-[350px]" />
        </div>
        <Skeleton className="h-10 w-[120px] rounded-xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] rounded-2xl" />
        <Skeleton className="col-span-3 h-[400px] rounded-2xl" />
      </div>
    </div>
  );
}
