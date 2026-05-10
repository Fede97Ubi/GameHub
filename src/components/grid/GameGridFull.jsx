import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GameCardFull } from './GameCardFull';

const getColumnsFromWidth = (width) => {
  if (width >= 1280) return 3; // Desktop largo
  if (width >= 768) return 2;  // Tablet
  return 1;                    // Mobile
};

export const GameGridFull = ({ games }) => {
  const parentRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    if (!parentRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(width);
        setColumns(getColumnsFromWidth(width));
      }
    });
    observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, []);

  const gap = 32; 
  const sidePadding = 16; 
  
  const availableWidth = containerWidth - (sidePadding * 2);
  const cardWidth = availableWidth > 0 
    ? (availableWidth - (gap * (columns - 1))) / columns 
    : 0;
    
  // Proporzione più "cinematografica" (es. 1:1 o 4:3 globale)
  // Sapendo che h-3/4 è media e h-1/4 è testo
  const cardHeight = cardWidth * 0.9; 

  const rowCount = Math.ceil(games.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight + gap,
    overscan: 3,
  });

  return (
    <div 
      ref={parentRef} 
      className="w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar"
      style={{ contain: 'strict' }}
    >
      <div
        className="relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          paddingLeft: `${sidePadding}px`,
          paddingTop: `${sidePadding}px`
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const fromIndex = virtualRow.index * columns;
          const toIndex = Math.min(fromIndex + columns, games.length);
          const rowGames = games.slice(fromIndex, toIndex);

          return rowGames.map((game, colIndex) => {
            const x = colIndex * (cardWidth + gap) + sidePadding;
            const y = virtualRow.start + sidePadding;

            return (
              <div
                key={game.id}
                className="absolute top-0 left-0"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `translate(${x}px, ${y}px)`,
                  willChange: 'transform',
                }}
              >
                <GameCardFull game={game} />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
