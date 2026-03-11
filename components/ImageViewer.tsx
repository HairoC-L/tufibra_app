"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, X, Move } from "lucide-react";

interface ImageViewerProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewer({ src, alt, isOpen, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-black/90 border-gray-800 flex flex-col overflow-hidden">
        <DialogHeader className="p-4 border-b border-gray-800 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-white">{alt || "Visor de Imagen"}</DialogTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-gray-800">
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-white text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-gray-800">
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset} className="text-white hover:bg-gray-800" title="Resetear">
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-gray-800">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div 
          className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
            }}
            onMouseDown={handleMouseDown}
            className="relative"
          >
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              className="max-h-[80vh] max-w-[90vw] object-contain pointer-events-none select-none"
            />
          </div>
          
          {scale > 1 && !isDragging && (
            <div className="absolute bottom-4 right-4 bg-black/50 p-2 rounded text-white text-xs flex items-center">
              <Move className="w-3 h-3 mr-1" /> Arrastra para mover
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
