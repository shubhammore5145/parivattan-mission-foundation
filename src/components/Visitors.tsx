import React, { useEffect, useState } from "react";
import {
  Activity,
  Eye,
  Users,
  BarChart3,
  Clock,
  Globe2,
  Calendar as CalendarIcon,
  ChevronDown,
  RefreshCw,
  CalendarDays,
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
    <section className="bg-transparent px-4 py-10 text-white md:py-12" id="visitors">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-2 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f2c5a8]">
              <Eye size={14} /> Visitor Overview
            </div>
            <h2 className="mt-2 text-2xl font-serif font-normal text-white md:text-3xl">
              Community At A Glance
            </h2>
          </div>
          <p className="max-w-sm text-sm text-white/55">
            Real-time and date-wise tracking of people connecting with our mission.
          </p>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <StatCard
            title="Live"
            value={liveVisitors}
            icon={<Activity />}
            isLive
          />
          <StatCard
            title="Today"
            value={loading ? "..." : stats.today}
            icon={<Clock />}
            onClick={() => handleDateSelect(new Date())}
            isActive={isSameDay(selectedDate, new Date())}
          />
          <StatCard
            title="Yesterday"
            value={loading ? "..." : stats.yesterday}
            icon={<Clock />}
            onClick={() => handleDateSelect(subDays(new Date(), 1))}
            isActive={isSameDay(selectedDate, subDays(new Date(), 1))}
          />
          <StatCard
            title="This Week"
            value={loading ? "..." : stats.thisWeek}
            icon={<BarChart3 />}
          />
          <StatCard
            title="This Month"
            value={loading ? "..." : stats.thisMonth}
            icon={<Globe2 />}
          />
          <StatCard
            title="Total"
            value={loading ? "..." : stats.total}
            icon={<Users />}
          />
        </div>

        {/* Interactive Calendar Date Lookup Section */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md transition-all md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5a37f]/20 text-[#f2c5a8] shadow-inner">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#f2c5a8]">
                    Date-wise Visitor Lookup
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
                    Calendar View
                  </span>
                </div>
                <div className="text-sm font-medium text-white/90">
                  Select any date to check historical visitors
                </div>
              </div>
            </div>

            {/* Date Select Button with Popover */}
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="group inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white shadow-md backdrop-blur-sm transition-all hover:border-[#f2c5a8]/60 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#f2c5a8]/40"
                  >
                    <CalendarIcon className="h-4 w-4 text-[#e5a37f] transition-transform group-hover:scale-110" />
                    <span>{format(selectedDate, "dd MMMM yyyy")}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-white/60 transition-transform group-hover:translate-y-0.5" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto rounded-2xl border border-white/20 bg-[#162720] p-4 text-white shadow-2xl backdrop-blur-xl z-50"
                  align="end"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#f2c5a8]">
                      Pick a Date
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDateSelect(new Date())}
                      className="text-[11px] font-medium text-white/70 underline underline-offset-2 hover:text-[#f2c5a8]"
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
                      caption_label: "text-sm font-semibold text-white",
                      nav_button:
                        "h-7 w-7 bg-white/10 hover:bg-white/20 text-white rounded-lg p-0 border border-white/10 transition-colors",
                      head_cell:
                        "text-[#f2c5a8]/80 rounded-md w-9 font-medium text-[0.8rem]",
                      day: "h-9 w-9 p-0 font-normal text-white hover:bg-white/15 hover:text-white rounded-lg transition-colors",
                      day_selected:
                        "!bg-[#b5623b] !text-white font-bold rounded-lg shadow-md hover:!bg-[#9e4e29]",
                      day_today:
                        "border border-[#f2c5a8] text-[#f2c5a8] font-bold",
                      day_outside: "text-white/20 opacity-30",
                      day_disabled:
                        "text-white/20 opacity-30 cursor-not-allowed hover:bg-transparent",
                    }}
                  />

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <span className="text-[11px] text-white/50">Quick picks:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDateSelect(new Date())}
                        className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/20 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDateSelect(subDays(new Date(), 1))}
                        className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/20 transition-colors"
                      >
                        Yesterday
                      </button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Quick Preset Buttons */}
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                  isSameDay(selectedDate, new Date())
                    ? "border-[#f2c5a8] bg-[#f2c5a8]/15 text-[#f2c5a8] font-semibold"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleDateSelect(subDays(new Date(), 1))}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                  isSameDay(selectedDate, subDays(new Date(), 1))
                    ? "border-[#f2c5a8] bg-[#f2c5a8]/15 text-[#f2c5a8] font-semibold"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Result Card for Selected Date */}
          <div className="mt-3.5 flex flex-col gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2c5a8]/15 text-[#f2c5a8]">
                <Clock size={16} />
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                  Selected Date Details
                </div>
                <div className="text-sm font-semibold text-white">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  {isSameDay(selectedDate, new Date()) && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      Today
                    </span>
                  )}
                  {isSameDay(selectedDate, subDays(new Date(), 1)) && (
                    <span className="ml-2 inline-flex items-center rounded-full border border-[#e5a37f]/30 bg-[#e5a37f]/20 px-2 py-0.5 text-[10px] font-bold text-[#f2c5a8]">
                      Yesterday
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-2 self-start sm:self-auto">
              {loadingDate ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#f2c5a8]">
                  <RefreshCw size={13} className="animate-spin text-[#e5a37f]" />
                  <span>Loading count...</span>
                </div>
              ) : (
                <>
                  <span className="text-2xl font-black tracking-tight text-[#f2c5a8]">
                    {selectedCount !== null ? selectedCount.toLocaleString() : "0"}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-white/60">
                    Visitors
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  isLive,
  onClick,
  isActive,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isLive?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`flex min-h-[76px] flex-col justify-between gap-2 rounded-xl border p-3 backdrop-blur-sm transition-all ${
        isActive
          ? "border-[#f2c5a8] bg-[#f2c5a8]/10 ring-1 ring-[#f2c5a8]/30 shadow-md"
          : "border-white/10 bg-white/[0.07] hover:border-white/20"
      } ${onClick ? "cursor-pointer hover:bg-white/10" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white/55">{title}</span>
        <span className="flex items-center gap-1.5 text-[#e5a37f]">
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          )}
          {icon}
        </span>
      </div>
      <div className="text-2xl font-bold text-[#f2c5a8]">{value}</div>
    </div>
  );
};

export default Visitors;

