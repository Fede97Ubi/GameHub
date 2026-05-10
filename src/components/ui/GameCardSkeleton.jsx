import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const GameCardSkeleton = ({ className }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "aspect-[2/3] w-full rounded-xl overflow-hidden",
          "animate-pulse bg-gradient-to-br from-zinc-800 to-zinc-900",
          "border border-white/5",
          className
        )
      )}
    />
  );
};
