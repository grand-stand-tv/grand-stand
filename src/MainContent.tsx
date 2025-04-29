import { useState, useEffect } from "react";
import { Calendar, Search, Filter, Loader, Sun, Moon } from "lucide-react";
import { format, parseISO } from "date-fns";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import EventCard from "./EventCard";
import SportFilter from "./SportFilter";
import SearchBar from "./SearchBar";
import Logo from "@/assets/logo-transparent.png";

// Types
export type Channel = {
  name: string;
  url: string;
};

export type Event = {
  unix_timestamp: number;
  sport: string;
  tournament: string;
  match: string;
  channels: string[];
};

export type EventsData = {
  events: {
    [date: string]: Event[];
  };
};

// Component types
interface FiltersPanelProps {
  availableDates: string[];
  availableSports: string[];
  selectedDate: string;
  selectedSport: string;
  setSelectedDate: (date: string) => void;
  setSelectedSport: (sport: string) => void;
}

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

// DateSelector Component
const DateSelector = ({
  dates,
  selectedDate,
  onSelectDate,
}: DateSelectorProps) => {
  if (dates.length === 0) return <div>No dates available</div>;

  return (
    <ScrollArea className="h-72">
      <div className="space-y-1">
        {dates.map((date) => (
          <Button
            key={date}
            variant={date === selectedDate ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectDate(date)}
          >
            {format(parseISO(date), "EEE, MMM d")}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

// FiltersPanel Component
const FiltersPanel = ({
  availableDates,
  availableSports,
  selectedDate,
  selectedSport,
  setSelectedDate,
  setSelectedSport,
}: FiltersPanelProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="w-4 h-4 mr-2" /> Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DateSelector
            dates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-4 h-4 mr-2" /> Filter by Sport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SportFilter
            sports={["All", ...availableSports]}
            selectedSport={selectedSport}
            onSelectSport={setSelectedSport}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Main Component
const MainContent = () => {
  const navigate = useNavigate();
  const { date: urlDate, sport: urlSport, search: urlSearch } = useParams();

  const [data, setData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      return savedMode ? savedMode === "true" : prefersDark;
    }
    return false;
  });

  const [selectedDate, setSelectedDate] = useState<string>(
    urlDate || format(new Date(), "yyyy-MM-dd")
  );
  const [selectedSport, setSelectedSport] = useState<string>(urlSport || "All");
  const [searchTerm, setSearchTerm] = useState<string>(urlSearch || "");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Toggle theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://topembed.pw/api.php?format=json"
        );
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load events data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    let path = `/events/${selectedDate}`;

    if (selectedSport !== "All") {
      path += `/${selectedSport}`;

      if (searchTerm) {
        path += `/${searchTerm}`;
      }
    } else if (searchTerm) {
      path += `/All/${searchTerm}`;
    }

    navigate(path, { replace: true });
  }, [selectedDate, selectedSport, searchTerm, navigate]);

  // Get available dates and sports from data
  const availableDates = data ? Object.keys(data.events).sort() : [];
  const availableSports = data
    ? Array.from(
        new Set(
          Object.values(data.events).flatMap((events) =>
            events.map((event) => event.sport)
          )
        )
      ).sort()
    : [];

  // Filter events based on selected date, sport and search term
  const filteredEvents =
    data && data.events[selectedDate]
      ? data.events[selectedDate].filter(
          (event) =>
            (selectedSport === "All" || event.sport === selectedSport) &&
            (searchTerm === "" ||
              event.match.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.tournament
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              event.sport.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : [];

  // Sort events by timestamp
  const sortedEvents = [...(filteredEvents || [])].sort(
    (a, b) => a.unix_timestamp - b.unix_timestamp
  );

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 mx-auto animate-spin" />
          <p className="text-lg font-medium">Loading Events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <CardTitle>Unable to Load Events</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0 gap-2">
              <img src={Logo} alt="" className="w-16 h-16" />
              <h1 className="text-2xl font-bold">GrandStand TV</h1>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-64 md:w-80">
                <SearchBar value={searchTerm} onSearch={setSearchTerm} />
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={toggleMobileFilter}
                className="lg:hidden"
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <FiltersPanel
              availableDates={availableDates}
              availableSports={availableSports}
              selectedDate={selectedDate}
              selectedSport={selectedSport}
              setSelectedDate={setSelectedDate}
              setSelectedSport={setSelectedSport}
            />
          </div>

          {/* Mobile Filters */}
          {isMobileFilterOpen && (
            <div className="lg:hidden mb-4 col-span-full">
              <FiltersPanel
                availableDates={availableDates}
                availableSports={availableSports}
                selectedDate={selectedDate}
                selectedSport={selectedSport}
                setSelectedDate={setSelectedDate}
                setSelectedSport={setSelectedSport}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h2 className="text-lg font-semibold">
                    {format(parseISO(selectedDate), "EEEE, MMMM d, yyyy")}
                  </h2>
                  <div className="mt-2 sm:mt-0 flex gap-2">
                    {selectedSport !== "All" && (
                      <Badge variant="outline">{selectedSport}</Badge>
                    )}
                    {searchTerm && (
                      <Badge variant="outline">"{searchTerm}"</Badge>
                    )}
                    <Badge>{sortedEvents.length} events</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {sortedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedEvents.map((event, index) => (
                  <EventCard key={index} event={event} />
                ))}
              </div>
            ) : (
              <Card className="text-center p-6">
                <div className="flex justify-center mb-4">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  Try changing your date, sport type, or search term.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 GrandStand TV • All rights reserved
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-muted-foreground">
                Data provided by{" "}
                <span className="font-medium">topembed.pw</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainContent;
