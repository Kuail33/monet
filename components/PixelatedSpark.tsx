import React from 'react';

export const PixelatedSpark = () => (
  <svg
    viewBox="0 0 100 100"
    className="text-[#E5BABA] fill-current animate-pulse"
  >
    <rect x="45" y="0" width="10" height="25" />
    <rect x="0" y="45" width="25" height="10" />
    <rect x="75" y="45" width="25" height="10" />
    <rect x="45" y="75" width="10" height="25" />
    <rect x="25" y="25" width="10" height="10" />
    <rect x="65" y="25" width="10" height="10" />
    <rect x="25" y="65" width="10" height="10" />
    <rect x="65" y="65" width="10" height="10" />
  </svg>
);
