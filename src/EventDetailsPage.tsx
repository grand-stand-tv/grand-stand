import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  Trophy,
  ArrowLeft,
  ExternalLink,
  Tv,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { EventsData, Event } from "./MainContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const EventDetailsPage = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);

      try {
        // Parse the eventSlug to extract information
        // Assume slug format like "mumbai-indians-lucknow-super-giants-ipl-cricket-1745748000"
        const slugParts = eventSlug?.split("-");

        if (!slugParts || slugParts.length < 2) {
          setError("Invalid event URL format");
          setLoading(false);
          return;
        }

        // Extract timestamp (last part of the slug)
        const timestamp = slugParts[slugParts.length - 1];

        if (!timestamp || !/^\d+$/.test(timestamp)) {
          setError("Invalid timestamp in URL");
          setLoading(false);
          return;
        }

        // Fetch all events from the API
        const response = await axios.get<EventsData>(
          "https://topembed.pw/api.php?format=json"
        );

        // Find events with matching timestamp
        const matchingEvents: Event[] = [];

        Object.entries(response.data.events).forEach(([_, dailyEvents]) => {
          dailyEvents.forEach((event) => {
            if (String(event.unix_timestamp) === timestamp) {
              matchingEvents.push(event);
            }
          });
        });

        if (matchingEvents.length === 0) {
          setError("No events found with this timestamp");
          setLoading(false);
          return;
        }

        // If only one event matches the timestamp, use that
        if (matchingEvents.length === 1) {
          setEvent(matchingEvents[0]);
          setLoading(false);
          return;
        }

        // Multiple events with same timestamp - find best match using text comparison
        let bestMatch: Event | null = null;
        let highestScore = 0;

        matchingEvents.forEach((event) => {
          // Calculate match score based on how many terms from the slug appear in the event data
          let score = 0;
          const eventText =
            `${event.match} ${event.tournament} ${event.sport}`.toLowerCase();

          // Remove timestamp from slug for text comparison
          const normalizedSlug = eventSlug?.toLowerCase();
          const slugTextParts = normalizedSlug
            ?.replace(new RegExp(`-${timestamp}$`), "")
            .split("-");

          // Count how many parts of the slug appear in the event text
          slugTextParts?.forEach((part) => {
            if (part.length > 2 && eventText.includes(part)) {
              // Only count meaningful parts (length > 2)
              score += part.length; // Longer matches get higher scores
            }
          });

          // Check event terms in slug as well
          const eventTerms = eventText.split(/\s+/);
          eventTerms.forEach((term) => {
            if (
              term.length > 2 &&
              normalizedSlug?.includes(term.toLowerCase())
            ) {
              score += term.length;
            }
          });

          // Update best match if this score is higher
          if (score > highestScore) {
            highestScore = score;
            bestMatch = event;
          }
        });

        if (bestMatch) {
          setEvent(bestMatch);
        } else {
          // If no good match found, just use the first event with matching timestamp
          setEvent(matchingEvents[0]);
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventSlug]);

  // Format the channel name from URL
  const formatChannelName = (channelUrl: string) => {
    const match = channelUrl.match(/\/channel\/(.+?)\[/);
    if (match && match[1]) {
      return match[1];
    }
    return channelUrl;
  };

  // Get the country from URL
  const getChannelCountry = (channelUrl: string) => {
    const match = channelUrl.match(/\[(.+?)\]/);
    if (match && match[1]) {
      return match[1];
    }
    return "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="pt-4">
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <h2 className="text-xl font-bold text-destructive">Error</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{error || "Event not found"}</p>
            <Button onClick={() => navigate("/")}>Go Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Event Details</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Badge>{event.sport}</Badge>
                <h1 className="text-2xl font-bold mt-2 mb-1">{event.match}</h1>
                <div className="flex items-center text-muted-foreground">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span>{event.tournament}</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>
                    {format(
                      new Date(event.unix_timestamp * 1000),
                      "MMMM d, yyyy"
                    )}
                  </span>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>
                    {format(new Date(event.unix_timestamp * 1000), "h:mm a")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold flex items-center">
              <Tv className="w-4 h-4 mr-2" />
              Available Channels
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.channels.map((channel, idx) => (
                <Button
                  key={idx}
                  asChild
                  variant="outline"
                  className="h-auto flex justify-between items-center p-4"
                >
                  <Link
                    to={`/watch/${eventSlug}/${encodeURIComponent(channel)}`}
                  >
                    <div className="flex flex-col items-start">
                      <div className="font-medium">
                        {formatChannelName(channel)}
                      </div>
                      {getChannelCountry(channel) && (
                        <div className="text-sm text-muted-foreground">
                          {getChannelCountry(channel)}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 GrandStand TV
            </p>
            <p className="text-sm text-muted-foreground mt-2 md:mt-0">
              Data provided by topembed.pw
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventDetailsPage;
