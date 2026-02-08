import { useState, useEffect } from 'react';
import { Train, Menu, X, User, Ticket, QrCode, LogOut } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

interface NavigationProps {
  onAuthClick: () => void;
  onTicketClick: () => void;
  onScanClick: () => void;
}

const Navigation = ({ onAuthClick, onTicketClick, onScanClick }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Crowd', href: '#crowd' },
    { label: 'Tickets', href: '#tickets' },
    { label: 'Routes', href: '#routes' },
    { label: 'Safety', href: '#safety' },
    { label: 'Dashboard', href: '#dashboard' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-500 ${
          isScrolled
            ? 'bg-[#070A12]/90 backdrop-blur-md border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-14 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Train className="w-5 h-5 lg:w-6 lg:h-6 text-[#00F0FF]" />
              <span className="font-semibold text-[#F4F6FF] text-sm lg:text-base tracking-tight">
                Smart Rail Mumbai
              </span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-[#A7B0C8] hover:text-[#00F0FF] transition-colors text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={onScanClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF] text-sm font-medium hover:bg-[#00F0FF]/30 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  Scan
                </button>
              )}
              
              <button
                onClick={onTicketClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F0FF] text-[#070A12] text-sm font-medium hover:bg-[#00F0FF]/90 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                Buy Ticket
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5">
                    <div className="w-6 h-6 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                      <User className="w-3 h-3 text-[#00F0FF]" />
                    </div>
                    <span className="text-sm text-[#F4F6FF]">{user?.full_name?.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-[#A7B0C8]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="btn-outline text-xs px-4 py-2"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-[#F4F6FF]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[999] bg-[#070A12]/98 backdrop-blur-lg lg:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
            {/* Close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X className="w-6 h-6 text-[#A7B0C8]" />
            </button>

            {/* User info */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#00F0FF]/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-[#00F0FF]" />
                </div>
                <div className="text-left">
                  <p className="text-[#F4F6FF] font-medium">{user?.full_name}</p>
                  <p className="text-sm text-[#A7B0C8]">{user?.email}</p>
                </div>
              </div>
            )}

            {/* Nav links */}
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="text-[#F4F6FF] text-2xl font-semibold hover:text-[#00F0FF] transition-colors"
              >
                {link.label}
              </button>
            ))}

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full max-w-xs mt-6">
              {isAdmin && (
                <button
                  onClick={() => {
                    onScanClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#00F0FF]/20 text-[#00F0FF]"
                >
                  <QrCode className="w-5 h-5" />
                  Scan QR Code
                </button>
              )}

              <button
                onClick={() => {
                  onTicketClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#00F0FF] text-[#070A12] font-semibold"
              >
                <Ticket className="w-5 h-5" />
                Buy Ticket
              </button>

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 text-[#A7B0C8]"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    onAuthClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-4 rounded-xl border border-[#00F0FF]/50 text-[#00F0FF]"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
