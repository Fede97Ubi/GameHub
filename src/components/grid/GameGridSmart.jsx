import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GameCard } from './GameCard';

// Ora calcoliamo le colonne in base alla larghezza REALE del contenitore
const getColumnsFromWidth = (width) => {
  if (width >= 1200) return 6;
  if (width >= 900) return 5;
  if (width >= 700) return 4;
  if (width >= 500) return 3;
  return 2;
};

export const GameGridSmart = ({ games, onGameSelect }) => {
  const parentRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [columns, setColumns] = useState(2);

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

  // Aumentiamo leggermente il gap a 24px per dare più respiro
  const gap = 24; 
  // Padding laterale per non far toccare i bordi alle card quando scalano in hover
  const sidePadding = 12; 
  
  const availableWidth = containerWidth - (sidePadding * 2);
  const cardWidth = availableWidth > 0 
    ? (availableWidth - (gap * (columns - 1))) / columns 
    : 0;
    
  const cardHeight = cardWidth * 1.5; 

  const rowCount = Math.ceil(games.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => cardHeight + gap,
    overscan: 5,
  });

  return (
    <div 
      ref={parentRef} 
      className="grid-container custom-scrollbar with-mask"
    >
      <div
        className="grid-content"
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
                className="grid-item"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `translate(${x}px, ${y}px)`,
                }}
              >
                <GameCard game={game} onSelect={onGameSelect} />
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
