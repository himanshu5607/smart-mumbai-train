import { useState, useEffect } from 'react';
import { X, Train, MapPin, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { ticketService } from '@/services/ticketService';
import { TicketQR } from '@/components/qr/TicketQR';
import type { Ticket } from '@/lib/supabase';

interface TicketPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TICKET_TYPES = [
  { id: 'single', name: 'Single Journey', price: 15, description: 'Valid until midnight' },
  { id: 'return', name: 'Return Journey', price: 25, description: 'Round trip, valid until midnight' },
  { id: 'daily', name: 'Daily Pass', price: 50, description: 'Unlimited rides for 24 hours' },
  { id: 'monthly', name: 'Monthly Pass', price: 500, description: 'Unlimited rides for 30 days' },
];

const LINES = [
  { id: 'Western Line', name: 'Western Line', color: '#00F0FF' },
  { id: 'Central Line', name: 'Central Line', color: '#F59E0B' },
  { id: 'Harbour Line', name: 'Harbour Line', color: '#10B981' },
  { id: 'Metro Line 1', name: 'Metro Line 1', color: '#8B5CF6' },
  { id: 'Metro Line 3', name: 'Metro Line 3', color: '#EC4899' },
];

const STATIONS = [
  'Churchgate', 'Marine Lines', 'Charni Road', 'Grant Road', 'Mumbai Central',
  'Dadar', 'Bandra', 'Andheri', 'Borivali', 'Virar',
  'CSMT', 'Byculla', 'Dadar', 'Kurla', 'Ghatkopar', 'Thane', 'Kalyan',
  'Wadala Road', 'Kings Circle', 'Govandi', 'Chembur',
];

export function TicketPurchaseModal({ isOpen, onClose }: TicketPurchaseModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [ticketType, setTicketType] = useState('single');
  const [line, setLine] = useState('Western Line');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [purchasedTicket, setPurchasedTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTicketType('single');
      setLine('Western Line');
      setFromStation('');
      setToStation('');
      setPurchasedTicket(null);
      setError(null);
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const ticket = await ticketService.purchaseTicket({
        type: ticketType as 'single' | 'return' | 'daily' | 'monthly',
        line,
        from_station: fromStation,
        to_station: toStation,
      });
      setPurchasedTicket(ticket);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to purchase ticket');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F1C] rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F4F6FF]">
            {step === 4 ? 'Ticket Purchased!' : 'Buy Ticket'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-[#A7B0C8]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Select Ticket Type */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-[#A7B0C8] mb-4">Select ticket type</p>
              {TICKET_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setTicketType(type.id);
                    setStep(2);
                  }}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${
                    ticketType === type.id
                      ? 'border-[#00F0FF] bg-[#00F0FF]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#F4F6FF]">{type.name}</p>
                      <p className="text-sm text-[#A7B0C8] mt-1">{type.description}</p>
                    </div>
                    <p className="text-xl font-bold text-[#00F0FF]">₹{type.price}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Line */}
          {step === 2 && (
            <div className="space-y-4">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-[#00F0FF] mb-4"
              >
                ← Back
              </button>
              <p className="text-[#A7B0C8] mb-4">Select line</p>
              {LINES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLine(l.id);
                    setStep(3);
                  }}
                  className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 ${
                    line === l.id
                      ? 'border-[#00F0FF] bg-[#00F0FF]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="font-medium text-[#F4F6FF]">{l.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Select Stations */}
          {step === 3 && (
            <div className="space-y-4">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-[#00F0FF] mb-4"
              >
                ← Back
              </button>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A7B0C8] mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    From Station
                  </label>
                  <select
                    value={fromStation}
                    onChange={(e) => setFromStation(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0B0F1C] border border-white/10 text-[#F4F6FF] focus:border-[#00F0FF] outline-none"
                  >
                    <option className="bg-[#0B0F1C] text-[#F4F6FF]" value="">
                      Select station
                    </option>
                    {STATIONS.map((s) => (
                      <option className="bg-[#0B0F1C] text-[#F4F6FF]" key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#A7B0C8] mb-2">
                    <Train className="w-4 h-4 inline mr-1" />
                    To Station
                  </label>
                  <select
                    value={toStation}
                    onChange={(e) => setToStation(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0B0F1C] border border-white/10 text-[#F4F6FF] focus:border-[#00F0FF] outline-none"
                  >
                    <option className="bg-[#0B0F1C] text-[#F4F6FF]" value="">
                      Select station
                    </option>
                    {STATIONS.map((s) => (
                      <option className="bg-[#0B0F1C] text-[#F4F6FF]" key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  onClick={handlePurchase}
                  disabled={!fromStation || !toStation || isLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ₹{TICKET_TYPES.find(t => t.id === ticketType)?.price}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Show QR Code */}
          {step === 4 && purchasedTicket && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#F4F6FF] mb-2">
                Purchase Successful!
              </h3>
              <p className="text-[#A7B0C8] mb-6">
                Show this QR code at the gate
              </p>
              
              <div className="bg-[#070A12] rounded-2xl p-6">
                <TicketQR ticket={purchasedTicket} size={180} />
              </div>

              <button
                onClick={onClose}
                className="mt-6 w-full btn-primary"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {step < 4 && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    s <= step ? 'bg-[#00F0FF]' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
