import React, { useState } from 'react';
import { Search, MapPin, CalendarDays, Grid, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.append('q', query.trim());
    if (date) params.append('date', date);
    if (location.trim()) params.append('loc', location.trim());
    
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-hairline/20 w-full max-w-4xl flex flex-col md:flex-row items-center p-2 relative z-10 gap-2 md:gap-0">
      
      {/* Service Input */}
      <div className="w-full md:flex-1 flex items-center justify-between px-3 md:px-5 h-14 md:h-16 hover:bg-surface-raised rounded-xl md:rounded-full cursor-pointer transition-colors group min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 w-full">
          <Grid className="h-5 w-5 text-ink-tertiary group-hover:text-brand transition-colors shrink-0" />
          <div className="flex flex-col justify-center min-w-0 w-full">
            <label className="text-[9px] sm:text-[10px] font-bold text-ink-secondary tracking-widest uppercase mb-0.5 truncate">Select Service</label>
            <input 
              type="text" 
              placeholder="Choose a service category" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent border-none p-0 text-xs sm:text-sm focus:outline-none focus:ring-0 text-ink placeholder:text-ink-tertiary font-semibold truncate"
            />
          </div>
        </div>
        {/* We can hide the chevron or keep it for aesthetics, let's keep it but fade it */}
        <ChevronDown className="h-4 w-4 text-ink-tertiary shrink-0 ml-2 hidden sm:block opacity-50" />
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-hairline/50 hidden md:block shrink-0" />

      {/* Date Input */}
      <div className="w-full md:flex-1 flex items-center justify-between px-3 md:px-5 h-14 md:h-16 hover:bg-surface-raised rounded-xl md:rounded-full cursor-pointer transition-colors group min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 w-full">
          <CalendarDays className="h-5 w-5 text-ink-tertiary group-hover:text-brand transition-colors shrink-0" />
          <div className="flex flex-col justify-center min-w-0 w-full relative">
            <label className="text-[9px] sm:text-[10px] font-bold text-ink-secondary tracking-widest uppercase mb-0.5 truncate">Date</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent border-none p-0 text-xs sm:text-sm focus:outline-none focus:ring-0 text-ink placeholder:text-ink-tertiary font-semibold truncate"
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-ink-tertiary shrink-0 ml-2 hidden sm:block opacity-50" />
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-hairline/50 hidden md:block shrink-0" />

      {/* Location Input */}
      <div className="w-full md:flex-1 flex items-center justify-between px-3 md:px-5 h-14 md:h-16 hover:bg-surface-raised rounded-xl md:rounded-full cursor-pointer transition-colors group min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 w-full">
          <MapPin className="h-5 w-5 text-ink-tertiary group-hover:text-brand transition-colors shrink-0" />
          <div className="flex flex-col justify-center min-w-0 w-full">
            <label className="text-[9px] sm:text-[10px] font-bold text-ink-secondary tracking-widest uppercase mb-0.5 truncate">Location</label>
            <input 
              type="text" 
              placeholder="Your location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent border-none p-0 text-xs sm:text-sm focus:outline-none focus:ring-0 text-ink placeholder:text-ink-tertiary font-semibold truncate"
            />
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-ink-tertiary shrink-0 ml-2 hidden sm:block opacity-50" />
      </div>

      {/* Action Button */}
      <div className="shrink-0 w-full md:w-auto p-1 md:pl-2 md:pr-1 md:py-0">
        <Button 
          variant="primary" 
          className="h-12 md:h-14 w-full md:w-auto px-6 lg:px-8 rounded-xl md:rounded-full font-bold shadow-md shadow-brand/20 transition-transform active:scale-95 text-white bg-brand hover:bg-brand/90"
          onClick={handleSearch}
        >
          Find Services
        </Button>
      </div>

    </div>
  );
}
