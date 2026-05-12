import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const GameCardSkeleton = ({ className }) => {
  return (
    <div className={`skeleton ${className || ''}`} />
  );
};
