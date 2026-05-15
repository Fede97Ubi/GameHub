import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GameCard } from './GameCard';

const getColumns = (width) => {
  if (width >= 1200) return 6;
  if (width >= 900)  return 5;
  if (width >= 700)  return 4;
  if (width >= 500)  return 3;
  return 2;
};

// Il padding laterale deve permettere alla card nell'angolo di scalare
// di 1.08× senza essere clippata. Formula:
//   sidePadding = cardWidth * (scaleMax - 1) / 2
// Dato che cardWidth non è noto prima del primo render, usiamo un padding
// fisso generoso (20px) che viene poi corretto dal ResizeObserver.
// In pratica: con colonne ≥4 le card sono abbastanza strette che 20px bastano.
// Con 2 colonne le card sono large e 20px bastano lo stesso perché 1.08 su
// una card da ~180px = solo ~7px di overflow per lato.
const SCALE_FACTOR = 1.08;
const GAP          = 20;

export const GameGridSmart = ({ games, onGameSelect }) => {
  const parentRef      = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [columns,        setColumns]        = useState(2);

  useEffect(() => {
    if (!parentRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setContainerWidth(w);
      setColumns(getColumns(w));
    });
    ro.observe(parentRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Calcolo dimensioni card ─────────────────────────────────────────────────
  // sidePadding dinamico: metà dello "sporgere" massimo della card in hover
  const rawCardWidth  = containerWidth > 0
    ? (containerWidth - GAP * (columns - 1)) / columns
    : 0;
  const sidePadding   = rawCardWidth > 0
    ? Math.ceil((rawCardWidth * (SCALE_FACTOR - 1)) / 2) + 4 + 20   // +4px margine sicurezza
    : 20;

  const availableWidth = containerWidth - sidePadding * 2;
  const cardWidth      = availableWidth > 0
    ? (availableWidth - GAP * (columns - 1)) / columns
    : 0;
  const cardHeight     = cardWidth * 1.5;   // proporzione 2:3 copertina videogioco

  const rowCount = Math.ceil(games.length / columns);

  const rowVirtualizer = useVirtualizer({
    count:           rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize:    () => cardHeight + GAP,
    overscan:        2,   // era 5 → teneva fino a 60 card nel DOM contemporaneamente
  });

  return (
    <div
      ref={parentRef}
      className="grid-container custom-scrollbar"
    >
      <div
        className="grid-content"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const from    = virtualRow.index * columns;
          const rowGames = games.slice(from, Math.min(from + columns, games.length));

          return rowGames.map((game, colIndex) => {
            const x = sidePadding + colIndex * (cardWidth + GAP);
            const y = virtualRow.start + sidePadding;

            return (
              <div
                key={game.id}
                className="grid-item"
                style={{
                  width:     `${cardWidth}px`,
                  height:    `${cardHeight}px`,
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