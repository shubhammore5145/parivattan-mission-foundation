import React, { useEffect, useState } from "react";
import {
  Activity,
  Eye,
  Users,
  Clock,
  Globe2,
  Calendar as CalendarIcon,
  ChevronDown,
  RefreshCw,
  CalendarDays,
  TrendingUp,
  ShieldCheck,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { format, subDays, isSameDay } from "date-fns";
import { useLiveVisitors } from "@/context/LiveVisitorsContext";
import { getVisitorStats, getVisitorsForDate, VisitorStats } from "@/lib/supabase-admin";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const Visitors = () => {
  const { count: liveVisitors } = useLiveVisitors();
  const [stats, setStats] = useState<VisitorStats>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  // Calendar Date Picker State
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [loadingDate, setLoadingDate] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateCache, setDateCache] = useState<Record<string, number>>({});

  // Initial load for overall stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getVisitorStats();
        setStats(data);

        // Preload today and yesterday in cache
        const todayKey = format(new Date(), "yyyy-MM-dd");
        const yesterdayKey = format(subDays(new Date(), 1), "yyyy-MM-dd");
        setDateCache((prev) => ({
          ...prev,
          [todayKey]: data.today,
          [yesterdayKey]: data.yesterday,
        }));
        setSelectedCount(data.today);
      } catch (err) {
        console.error("Failed to load visitor stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch count whenever a new date is selected
  const fetchCountForDate = async (targetDate: Date) => {
    const key = format(targetDate, "yyyy-MM-dd");
    if (dateCache[key] !== undefined) {
      setSelectedCount(dateCache[key]);
      return;
    }

    try {
      setLoadingDate(true);
      const count = await getVisitorsForDate(targetDate);
      setSelectedCount(count);
      setDateCache((prev) => ({ ...prev, [key]: count }));
    } catch (err) {
      console.error("Failed to load visitor count for selected date", err);
      setSelectedCount(0);
    } finally {
      setLoadingDate(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    fetchCountForDate(date);
    setIsCalendarOpen(false);
  };

  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-16 text-white" id="visitors">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#b5623b]/15 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f2c5a8]/30 bg-[#f2c5a8]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#f2c5a8]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
              </span>
              <Eye size={14} className="text-[#f2c5a8]" />
              <span>Visitor Overview & Live Footprint</span>
            </div>
            <h2 className="mt-2.5 text-2xl font-serif font-bold text-white md:text-3xl lg:text-4xl tracking-tight">
              Community Footprint At A Glance
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-300 max-w-xl">
              Live engagement tracking and historical date-wise records connecting students and patrons across Maharashtra.
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2.5 text-xs text-stone-300">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Live Updates</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
              <Radio size={14} className="text-emerald-400 animate-pulse" />
              <span>Real-Time Sync</span>
            </div>
          </div>
        </div>

        {/* 6 Harmonious, Neat KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {/* 1. Live Now */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.09] hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Active Now
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Activity size={15} />
              </div>
            </div>
            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-300 tracking-tight">
                {liveVisitors}
              </div>
              <div className="text-[11px] font-medium text-stone-300/80 mt-0.5 truncate">
                Active sessions
              </div>
            </div>
          </div>

          {/* 2. Today */}
          <div
            onClick={() => handleDateSelect(new Date())}
            role="button"
            tabIndex={0}
            className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${
              isSameDay(selectedDate, new Date())
                ? "border-[#f2c5a8] bg-[#f2c5a8]/15 ring-1 ring-[#f2c5a8]/40 shadow-lg"
                : "border-white/10 bg-white/[0.06] hover:bg-white/[0.09] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#f2c5a8] border border-white/10">
                Today
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#b5623b]/20 text-[#f2c5a8]">
                <Clock size={15} />
              </div>
            </div>
            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {loading ? "..." : stats.today.toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-stone-300/80 mt-0.5 truncate">
                Past 24 hours
              </div>
            </div>
          </div>

          {/* 3. Yesterday */}
          <div
            onClick={() => handleDateSelect(subDays(new Date(), 1))}
            role="button"
            tabIndex={0}
            className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${
              isSameDay(selectedDate, subDays(new Date(), 1))
                ? "border-[#f2c5a8] bg-[#f2c5a8]/15 ring-1 ring-[#f2c5a8]/40 shadow-lg"
                : "border-white/10 bg-white/[0.06] hover:bg-white/[0.09] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-stone-200 border border-white/10">
                Yesterday
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-stone-300">
                <CalendarDays size={15} />
              </div>
            </div>
            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {loading ? "..." : stats.yesterday.toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-stone-300/80 mt-0.5 truncate">
                Closed 24h count
              </div>
            </div>
          </div>

          {/* 4. This Week */}
          <div
            onClick={() => handleDateSelect(subDays(new Date(), 7))}
            role="button"
            tabIndex={0}
            className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${
              isSameDay(selectedDate, subDays(new Date(), 7))
                ? "border-[#f2c5a8] bg-[#f2c5a8]/15 ring-1 ring-[#f2c5a8]/40 shadow-lg"
                : "border-white/10 bg-white/[0.06] hover:bg-white/[0.09] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-stone-200 border border-white/10">
                This Week
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-stone-300">
                <TrendingUp size={15} />
              </div>
            </div>
            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {loading ? "..." : stats.thisWeek.toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-stone-300/80 mt-0.5 truncate">
                Past 7 days
              </div>
            </div>
          </div>

          {/* 5. This Month */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.09] hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-stone-200 border border-white/10">
                This Month
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-stone-300">
                <Globe2 size={15} />
              </div>
            </div>
            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {loading ? "..." : stats.thisMonth.toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-stone-300/80 mt-0.5 truncate">
                Past 30 days
              </div>
            </div>
          </div>

          {/* 6. Total All-Time */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-white/[0.09] hover:border-white/20">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#f2c5a8] border border-white/10">
                All-Time
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#b5623b]/20 text-[#f2c5a8]">
                <Users size={15} />
              </div>
            </div>
            <div className="mt-3.5">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#f2c5a8] tracking-tight">
                {loading ? "..." : stats.total.toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-stone-300/80 mt-0.5 truncate">
                Total visits
              </div>
            </div>
          </div>
        </div>

        {/* Clean & Neat Date-Wise Archive Panel */}
        <div className="rounded-2xl border border-white/15 bg-black/25 p-5 sm:p-6 backdrop-blur-md shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b5623b] text-white shadow-md">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                  Daily Visitor Archive
                </h3>
                <p className="text-xs text-stone-300">
                  Select any date to check exact historical visitor attendance.
                </p>
              </div>
            </div>

            {/* Quick Presets & Calendar Button */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isSameDay(selectedDate, new Date())
                    ? "bg-[#b5623b] text-white shadow-sm font-bold"
                    : "border border-white/15 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => handleDateSelect(subDays(new Date(), 1))}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isSameDay(selectedDate, subDays(new Date(), 1))
                    ? "bg-[#b5623b] text-white shadow-sm font-bold"
                    : "border border-white/15 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                Yesterday
              </button>

              <button
                type="button"
                onClick={() => handleDateSelect(subDays(new Date(), 7))}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isSameDay(selectedDate, subDays(new Date(), 7))
                    ? "bg-[#b5623b] text-white shadow-sm font-bold"
                    : "border border-white/15 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                7 Days Ago
              </button>

              {/* Main Calendar Popover Button */}
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md transition-all hover:border-[#f2c5a8] hover:bg-white/15 cursor-pointer"
                  >
                    <CalendarIcon className="h-3.5 w-3.5 text-[#f2c5a8]" />
                    <span>{format(selectedDate, "dd MMMM yyyy")}</span>
                    <ChevronDown className="h-3 w-3 text-stone-300" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto rounded-2xl border border-white/20 bg-[#162720]/95 p-3.5 text-white shadow-2xl backdrop-blur-2xl z-50"
                  align="end"
                >
                  <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2 px-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#f2c5a8]">
                      Select Date
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDateSelect(new Date())}
                      className="text-[11px] font-semibold text-white/80 underline underline-offset-2 hover:text-[#f2c5a8] transition"
                    >
                      Jump to Today
                    </button>
                  </div>

                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => d && handleDateSelect(d)}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    className="bg-transparent text-white"
                    classNames={{
                      caption_label: "text-sm font-bold text-white font-serif",
                      nav_button:
                        "h-7 w-7 bg-white/10 hover:bg-white/20 text-white rounded-lg p-0 border border-white/10 transition-colors",
                      head_cell:
                        "text-[#f2c5a8]/80 rounded-md w-9 font-semibold text-[0.8rem]",
                      day: "h-9 w-9 p-0 font-normal text-white hover:bg-white/20 hover:text-white rounded-xl transition-colors",
                      day_selected:
                        "!bg-[#b5623b] !text-white font-bold rounded-xl shadow-lg hover:!bg-[#9e4e29]",
                      day_today:
                        "border-2 border-[#f2c5a8] text-[#f2c5a8] font-bold rounded-xl",
                      day_outside: "text-white/20 opacity-30",
                      day_disabled:
                        "text-white/20 opacity-30 cursor-not-allowed hover:bg-transparent",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Clean Selected Date Record Strip */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3.5 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2c5a8]/15 text-[#f2c5a8]">
                <Clock size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Selected Record
                  </span>
                  {isSameDay(selectedDate, new Date()) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Today (Live)
                    </span>
                  )}
                  {isSameDay(selectedDate, subDays(new Date(), 1)) && (
                    <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Yesterday
                    </span>
                  )}
                  {!isSameDay(selectedDate, new Date()) && !isSameDay(selectedDate, subDays(new Date(), 1)) && (
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-stone-300">
                      Archived Log
                    </span>
                  )}
                </div>
                <div className="text-sm sm:text-base font-serif font-bold text-white mt-0.5">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </div>
              </div>
            </div>

            {/* Counter */}
            <div className="flex items-baseline gap-2 self-start sm:self-auto rounded-xl border border-white/10 bg-white/5 px-4 py-2">
              {loadingDate ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#f2c5a8]">
                  <RefreshCw size={14} className="animate-spin text-[#e5a37f]" />
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-serif font-bold text-[#f2c5a8]">
                    {selectedCount !== null ? selectedCount.toLocaleString() : "0"}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                    Visitors
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 ml-2">
                    <CheckCircle2 size={13} />
                    <span>Verified</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Visitors;
