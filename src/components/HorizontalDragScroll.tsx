"use client";

import { useRef } from "react";

export default function HorizontalDragScroll({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const didMoveRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    didMoveRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    didMoveRef.current = true;
    e.preventDefault();
    const walk = e.clientX - startXRef.current;
    scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    scrollLeftRef.current = scrollRef.current.scrollLeft;
    startXRef.current = e.clientX;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setTimeout(() => { didMoveRef.current = false; }, 0);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (didMoveRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={scrollRef}
      className={`flex items-start gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4 cursor-grab active:cursor-grabbing select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onClickCapture={handleClickCapture}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
}
