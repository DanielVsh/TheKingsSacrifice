import { useEffect, useState } from "react";

export function useBoardSize(sidebarWidth = 192, topOffset = 220) {
  const [size, setSize] = useState(520);

  useEffect(() => {
    const calculateSize = () => {
      const availableWidth = window.innerWidth - sidebarWidth - 32;
      const availableHeight = window.innerHeight - topOffset;

      const boardSize = Math.floor(
        Math.min(availableWidth, availableHeight)
      );

      setSize(boardSize);
    };

    calculateSize();
    window.addEventListener("resize", calculateSize);
    return () => window.removeEventListener("resize", calculateSize);
  }, [sidebarWidth, topOffset]);

  return size;
}