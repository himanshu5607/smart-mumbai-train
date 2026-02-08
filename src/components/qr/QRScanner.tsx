import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, XCircle } from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import type { Ticket } from '@/lib/supabase';

interface QRScannerProps {
  onClose: () => void;
  onSuccess?: (result: { valid: boolean; ticket?: Ticket; message: string }) => void;
}

export function QRScanner({ onClose, onSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ valid: boolean; ticket?: Ticket; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const startScanning = async () => {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            // Stop scanning after successful read
            await scanner.stop();
            setIsScanning(false);

            // Validate ticket
            try {
              const result = await ticketService.validateTicket(decodedText);
              setScanResult(result);
              onSuccess?.(result);
            } catch (err) {
              setError('Failed to validate ticket');
            }
          },
          () => {
            // QR code not found - continue scanning
          }
        );
        setIsScanning(true);
      } catch (err) {
        setError('Failed to start camera. Please ensure camera permissions are granted.');
      }
    };

    startScanning();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onSuccess]);

  const handleClose = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    onClose();
  };

  const handleScanAgain = async () => {
    setScanResult(null);
    setError(null);
    
    if (scannerRef.current) {
      try {
        await scannerRef.current.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText) => {
            await scannerRef.current?.stop();
            setIsScanning(false);

            try {
              const result = await ticketService.validateTicket(decodedText);
              setScanResult(result);
              onSuccess?.(result);
            } catch (err) {
              setError('Failed to validate ticket');
            }
          },
          () => {}
        );
        setIsScanning(true);
      } catch (err) {
        setError('Failed to restart camera');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#00F0FF]" />
          <span className="text-white font-medium">Scan Ticket QR Code</span>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Scanner or Result */}
      <div className="w-full max-w-md">
        {!scanResult && !error && (
          <>
            {/* Scanner Viewport */}
            <div 
              id="qr-reader" 
              className="w-full aspect-square rounded-2xl overflow-hidden relative"
            />
            
            {/* Scanning Indicator */}
            {isScanning && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
                <span className="text-white/70 text-sm">Scanning...</span>
              </div>
            )}
            
            {/* Instructions */}
            <p className="text-center text-white/70 mt-4">
              Position the QR code within the frame to scan
            </p>
          </>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="bg-[#0B0F1C] rounded-2xl p-6 text-center">
            {scanResult.valid ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-500 mb-2">
                  Ticket Valid
                </h3>
                <p className="text-[#A7B0C8] mb-4">{scanResult.message}</p>
                {scanResult.ticket && (
                  <div className="text-left bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-sm text-[#A7B0C8]">Line: <span className="text-white">{scanResult.ticket.line}</span></p>
                    <p className="text-sm text-[#A7B0C8] mt-1">From: <span className="text-white">{scanResult.ticket.from_station}</span></p>
                    <p className="text-sm text-[#A7B0C8] mt-1">To: <span className="text-white">{scanResult.ticket.to_station}</span></p>
                    <p className="text-sm text-[#A7B0C8] mt-1">Type: <span className="text-white capitalize">{scanResult.ticket.type}</span></p>
                  </div>
                )}
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-500 mb-2">
                  Invalid Ticket
                </h3>
                <p className="text-[#A7B0C8]">{scanResult.message}</p>
              </>
            )}
            
            <button
              onClick={handleScanAgain}
              className="mt-6 w-full btn-primary"
            >
              Scan Another
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#0B0F1C] rounded-2xl p-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-500 mb-2">
              Error
            </h3>
            <p className="text-[#A7B0C8]">{error}</p>
            <button
              onClick={handleScanAgain}
              className="mt-6 w-full btn-primary"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
