import { Clock, Tv } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "./MainContent";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const timestamp = new Date(event.unix_timestamp * 1000);

  // Format the channel name from URL
  const formatChannelName = (channelUrl: string) => {
    // Extract the part between /channel/ and [
    const match = channelUrl.match(/\/channel\/(.+?)\[/);
    if (match && match[1]) {
      return match[1];
    }
    return channelUrl;
  };

  // Get the country from URL
  const getChannelCountry = (channelUrl: string) => {
    // Extract the part between [ and ]
    const match = channelUrl.match(/\[(.+?)\]/);
    if (match && match[1]) {
      return match[1];
    }
    return "";
  };

  // Generate a slug for the event to use in the URL
  const generateEventSlug = () => {
    return `${event.sport.toLowerCase().replace(/\s+/g, "-")}-${event.match
      .toLowerCase()
      .replace(/\s+/g, "-")}-${event.unix_timestamp}`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline">{event.sport}</Badge>
          <div className="flex items-center text-muted-foreground">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{format(timestamp, "h:mm a")}</span>
          </div>
        </div>
        <div className="mt-2">
          <h3 className="font-bold text-lg">{event.match}</h3>
          <p className="text-sm text-muted-foreground">{event.tournament}</p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-2">
              <Tv className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-sm">
                Available on {event.channels.length} channels
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.channels.slice(0, 3).map((channel, idx) => (
                <Link
                  key={idx}
                  to={`/watch/${generateEventSlug()}/${encodeURIComponent(
                    channel
                  )}`}
                >
                  <Badge variant="secondary" className="hover:bg-secondary/80">
                    {formatChannelName(channel)}
                    {getChannelCountry(channel) && (
                      <span className="ml-1 opacity-70">
                        ({getChannelCountry(channel)})
                      </span>
                    )}
                  </Badge>
                </Link>
              ))}
              {event.channels.length > 3 && (
                <Link to={`/event/${generateEventSlug()}`}>
                  <Badge variant="secondary" className="hover:bg-secondary/80">
                    +{event.channels.length - 3} more
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end pt-0">
        <Button asChild size="sm">
          <Link to={`/event/${generateEventSlug()}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
