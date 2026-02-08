import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, XCircle } from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import type { Ticket } from '@/lib/supabase';

interface QRScannerProps {
  onClose: () => void;
  onDone?: () => void;
  onSuccess?: (result: { valid: boolean; ticket?: Ticket; message: string }) => void;
}

export function QRScanner({ onClose, onDone, onSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const hasResultRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{ valid: boolean; ticket?: Ticket; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  const getQrBoxSize = () => {
    if (typeof window === 'undefined') return 280;
    const base = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(240, Math.min(360, Math.floor(base * 0.6)));
  };

  const scanConfig = () => ({
    fps: 12,
    qrbox: { width: getQrBoxSize(), height: getQrBoxSize() },
    aspectRatio: 1.0,
  });

  const safeStopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      await Promise.race([
        scanner.stop(),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch {
      // ignore stop errors/timeouts
    }

    try {
      scanner.clear?.();
    } catch {
      // ignore clear errors
    }
  }, []);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const handleDecoded = useCallback(async (decodedText: string) => {
    if (hasResultRef.current) return;
    hasResultRef.current = true;
    setIsScanning(false);
    setIsProcessing(true);
    setError(null);

    await safeStopScanner();

    try {
      const result = await ticketService.validateTicket(decodedText);
      setScanResult(result);
      onSuccessRef.current?.(result);
    } catch {
      setError('Failed to validate ticket');
      hasResultRef.current = false;
    } finally {
      setIsProcessing(false);
    }
  }, [safeStopScanner]);

  const startScanner = useCallback(
    async (scanner: Html5Qrcode) => {
      if (hasResultRef.current) return;
      await scanner.start(
        { facingMode: 'environment' },
        scanConfig(),
        handleDecoded,
        () => {
          // QR code not found - continue scanning
        }
      );
      setIsScanning(true);
    },
    [handleDecoded]
  );

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    startScanner(scanner).catch(() => {
      setError('Failed to start camera. Please ensure camera permissions are granted.');
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        try {
          scannerRef.current.clear?.();
        } catch {
          // ignore clear errors
        }
      }
    };
  }, [startScanner]);

  const handleClose = async () => {
    void safeStopScanner();
    onClose();
  };

  const handleDone = async () => {
    void safeStopScanner();
    onClose();
    onDone?.();
  };

  const handleScanAgain = async () => {
    setScanResult(null);
    setError(null);
    setManualCode('');
    setIsProcessing(false);
    hasResultRef.current = false;
    
    try {
      setIsScanning(false);
      await safeStopScanner();
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Wait for the QR reader element to re-render
      for (let i = 0; i < 10; i += 1) {
        if (document.getElementById('qr-reader')) break;
        await new Promise((resolve) => setTimeout(resolve, 60));
      }

      if (!document.getElementById('qr-reader')) {
        throw new Error('QR reader not ready');
      }

      const freshScanner = new Html5Qrcode('qr-reader');
      scannerRef.current = freshScanner;
      await startScanner(freshScanner);
    } catch {
      setError('Failed to restart camera');
    }
  };

  const handleManualValidate = async () => {
    const value = manualCode.trim();
    if (!value) return;
    setError(null);
    setIsProcessing(true);
    hasResultRef.current = true;
    try {
      const result = await ticketService.validateTicket(value);
      setScanResult(result);
      onSuccessRef.current?.(result);
    } catch {
      setError('Failed to validate ticket');
      hasResultRef.current = false;
    } finally {
      setIsProcessing(false);
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
      <div className="w-full max-w-2xl">
        {!scanResult && !error && !isProcessing && (
          <>
            {/* Scanner Viewport */}
            <div 
              id="qr-reader" 
              className="w-full aspect-square rounded-2xl overflow-hidden relative bg-black/40 border border-white/10"
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
            <p className="text-center text-white/40 text-xs mt-2">
              Tip: Use another device to show the QR code if you are scanning on the same phone.
            </p>

            {/* Manual fallback */}
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-[#A7B0C8] mb-2">Trouble scanning? Paste the QR data here:</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Paste QR text or ticket ID"
                  className="flex-1 px-3 py-2 rounded-lg bg-[#0B0F1C] border border-white/10 text-[#F4F6FF] text-sm outline-none focus:border-[#00F0FF]"
                />
                <button
                  onClick={handleManualValidate}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Confirm
                </button>
              </div>
            </div>
          </>
        )}

        {/* Processing */}
        {isProcessing && !scanResult && !error && (
          <div className="bg-[#0B0F1C] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#00F0FF] border-t-transparent animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#F4F6FF] mb-2">
              Confirming ticket...
            </h3>
            <p className="text-[#A7B0C8] text-sm">
              Please wait while we validate this ticket.
            </p>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="bg-[#0B0F1C] rounded-2xl p-6 text-center">
            {scanResult.valid ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-500 mb-2">
                  Ticket Confirmed
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
            <button
              onClick={handleDone}
              className="mt-3 w-full btn-outline"
            >
              Done
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
