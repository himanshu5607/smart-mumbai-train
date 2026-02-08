import { supabase } from '@/lib/supabase';
import type { Ticket } from '@/lib/supabase';

export interface PurchaseTicketData {
  type: 'single' | 'return' | 'daily' | 'monthly';
  line: string;
  from_station: string;
  to_station: string;
}

export const ticketService = {
  // Get all tickets for current user
  async getUserTickets(): Promise<Ticket[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get active tickets
  async getActiveTickets(): Promise<Ticket[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Purchase a new ticket
  async purchaseTicket(ticketData: PurchaseTicketData): Promise<Ticket> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate QR code data
        // Generate QR code data
    const ticketId = crypto.randomUUID();
    const qrData = JSON.stringify({
      ticketId,
      userId: user.id,
      timestamp: Date.now(),
    });

    // Calculate validity based on ticket type
    const validUntil = new Date();
    switch (ticketData.type) {
      case 'single':
      case 'return':
        validUntil.setHours(23, 59, 59, 999);
        break;
      case 'daily':
        validUntil.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        validUntil.setMonth(validUntil.getMonth() + 1);
        break;
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        id: ticketId,
        user_id: user.id,
        type: ticketData.type,
        line: ticketData.line,
        from_station: ticketData.from_station,
        to_station: ticketData.to_station,
        qr_code: qrData,
        valid_until: validUntil.toISOString(),
        status: 'active',
      })
      .select()
      .single();



    if (error) throw error;
    return data;
  },

  // Validate ticket (for admin scanner)
  async validateTicket(qrData: string): Promise<{ valid: boolean; ticket?: Ticket; message: string }> {
    try {
      const rawText = qrData.trim();
      let ticketId: string | null = null;

      try {
        const parsed = JSON.parse(rawText);
        ticketId = parsed?.ticketId || parsed?.id || null;
      } catch {
        ticketId = rawText;
      }

      let ticket: Ticket | null = null;

      if (ticketId) {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('id', ticketId)
          .single();

        if (!error && data) {
          ticket = data;
        }
      }

      if (!ticket) {
        const { data } = await supabase
          .from('tickets')
          .select('*')
          .eq('qr_code', rawText)
          .single();
        if (data) ticket = data;
      }

      if (!ticket) {
        return { valid: false, message: 'Invalid ticket' };
      }

      if (ticket.status === 'used') {
        return { valid: false, ticket, message: 'Ticket already used' };
      }

      if (ticket.status === 'expired' || new Date(ticket.valid_until) < new Date()) {
        return { valid: false, ticket, message: 'Ticket expired' };
      }

      // Mark ticket as used
      await supabase
        .from('tickets')
        .update({ status: 'used', used_at: new Date().toISOString() })
        .eq('id', ticket.id);

      return { valid: true, ticket, message: 'Ticket validated successfully' };
    } catch {
      return { valid: false, message: 'Invalid QR code' };
    }
  },

  // Get ticket by ID
  async getTicketById(id: string): Promise<Ticket | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },
};
