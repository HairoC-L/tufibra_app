"use client"

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export function CameraCaptureModal({ isOpen, onClose, onCapture }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasPermission(true);
        } catch (err) {
          console.error("Error accessing camera:", err);
          setHasPermission(false);
          toast.error("No se pudo acceder a la cámara. Verifique los permisos.");
        }
      };
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            onCapture(file);
          }
        }, "image/jpeg", 0.8);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-gray-700 p-0 max-w-lg overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Cámara de Captura</DialogTitle>
          <DialogDescription>Captura de fotos para fachadas y órdenes de trabajo</DialogDescription>
        </DialogHeader>
        <div className="relative aspect-[3/4] bg-black flex items-center justify-center">
          {hasPermission === false && (
            <div className="text-white text-center p-4">
              <AlertTriangle className="mx-auto w-12 h-12 text-yellow-500 mb-2" />
              <p>No se pudo acceder a la cámara.</p>
              <p className="text-xs text-gray-400 mt-2">Asegúrese de estar usando HTTPS y haber otorgado permisos.</p>
              <Button onClick={onClose} className="mt-4">Cerrar</Button>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 items-center px-4">
            <Button 
              variant="outline" 
              className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </Button>
            
            <button 
              onClick={takePhoto}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
              type="button"
            >
              <div className="w-12 h-12 bg-white rounded-full group-hover:bg-gray-200" />
            </button>
            
            <div className="w-[88px]" /> {/* Spacer for symmetry */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
