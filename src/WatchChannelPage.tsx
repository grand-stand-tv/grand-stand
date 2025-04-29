import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import axios from "axios";
import { EventsData, Event } from "./MainContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const WatchChannelPage = () => {
  const { eventSlug, channelUrl } = useParams<{
    eventSlug: string;
    channelUrl: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [decodedChannelUrl, setDecodedChannelUrl] = useState<string>("");

  useEffect(() => {
    if (channelUrl) {
      setDecodedChannelUrl(decodeURIComponent(channelUrl));
    }

    const fetchEvent = async () => {
      setLoading(true);

      try {
        // Parse the eventSlug to extract information
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
  }, [eventSlug, channelUrl]);

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
        <div className="text-center space-y-4">
          <Skeleton className="w-12 h-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
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
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="icon"
                className="mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg md:text-xl font-bold truncate">
                {event.match}
              </h1>
            </div>

            <Button asChild variant="outline" size="sm">
              <Link to={`/event/${eventSlug}`}>
                <Info className="w-4 h-4 mr-2" />
                Event Details
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {formatChannelName(decodedChannelUrl)}
                </div>
                {getChannelCountry(decodedChannelUrl) && (
                  <div className="text-sm text-muted-foreground">
                    {getChannelCountry(decodedChannelUrl)}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <div className="aspect-w-16 aspect-h-9 w-full">
            <iframe
              src={decodedChannelUrl}
              title={`${event.match} - ${formatChannelName(decodedChannelUrl)}`}
              className="w-full"
              style={{ height: "calc(100vh - 240px)", minHeight: "480px" }}
              allowFullScreen
            ></iframe>
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold">
              More Channels for {event.match}
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {event.channels
                .filter((channel) => channel !== decodedChannelUrl)
                .map((channel, idx) => (
                  <Button
                    key={idx}
                    asChild
                    variant="outline"
                    className="h-auto flex flex-col items-center justify-center p-3"
                  >
                    <Link
                      to={`/watch/${eventSlug}/${encodeURIComponent(channel)}`}
                      className="text-center"
                    >
                      <div className="text-sm font-medium truncate">
                        {formatChannelName(channel)}
                      </div>
                      {getChannelCountry(channel) && (
                        <div className="text-xs text-muted-foreground truncate">
                          {getChannelCountry(channel)}
                        </div>
                      )}
                    </Link>
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t mt-auto py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 GrandStand TV - Data provided by topembed.pw</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WatchChannelPage;
