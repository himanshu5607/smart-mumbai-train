import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Ticket } from '@/lib/supabase';

interface TicketQRProps {
  ticket: Ticket;
  size?: number;
}

export function TicketQR({ ticket, size = 200 }: TicketQRProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const validUntil = new Date(ticket.valid_until);
      const diff = validUntil.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [ticket.valid_until]);

  const getStatusColor = () => {
    if (ticket.status === 'used') return 'text-yellow-500';
    if (isExpired || ticket.status === 'expired') return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (ticket.status === 'used') return 'Used';
    if (isExpired || ticket.status === 'expired') return 'Expired';
    return 'Active';
  };

  return (
    <div className="flex flex-col items-center">
      {/* QR Code */}
      <div className="relative p-4 bg-white rounded-xl">
        <QRCodeSVG
          value={ticket.qr_code}
          size={size}
          level="H"
          includeMargin={false}
        />
        
        {/* Scan line animation */}
        {ticket.status === 'active' && !isExpired && (
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent animate-scan" />
          </div>
        )}

        {/* Status overlay */}
        {(ticket.status === 'used' || isExpired) && (
          <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
            {ticket.status === 'used' ? (
              <CheckCircle className="w-16 h-16 text-yellow-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Ticket Info */}
      <div className="mt-4 text-center">
        <div className={`flex items-center justify-center gap-2 ${getStatusColor()}`}>
          <div className={`w-2 h-2 rounded-full ${
            ticket.status === 'active' && !isExpired ? 'bg-green-500 animate-pulse' : 
            ticket.status === 'used' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="font-medium">{getStatusText()}</span>
        </div>
        
        {ticket.status === 'active' && !isExpired && (
          <div className="flex items-center justify-center gap-2 mt-2 text-[#A7B0C8]">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Valid for {timeLeft}</span>
          </div>
        )}

        <div className="mt-3 text-sm text-[#A7B0C8]">
          <p>{ticket.line}</p>
          <p className="mt-1">{ticket.from_station} → {ticket.to_station}</p>
          <p className="mt-1 capitalize">{ticket.type} Ticket</p>
        </div>
      </div>
    </div>
  );
}
