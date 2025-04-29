import { Button } from "@/components/ui/button";

interface SportFilterProps {
  sports: string[];
  selectedSport: string;
  onSelectSport: (sport: string) => void;
}

const SportFilter = ({
  sports,
  selectedSport,
  onSelectSport,
}: SportFilterProps) => {
  // Get sport icon
  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case "football":
        return "⚽";
      case "basketball":
        return "🏀";
      case "baseball":
        return "⚾";
      case "ice hockey":
        return "🏒";
      case "tennis":
        return "🎾";
      case "cricket":
        return "🏏";
      case "rugby union":
      case "rugby":
        return "🏉";
      case "volleyball":
        return "🏐";
      case "handball":
        return "🤾";
      case "sailing":
        return "⛵";
      case "softball":
        return "🥎";
      case "all":
        return "🏆";
      default:
        return "🎮";
    }
  };

  return (
    <div className="space-y-1">
      {sports.map((sport) => (
        <Button
          key={sport}
          onClick={() => onSelectSport(sport)}
          variant={selectedSport === sport ? "default" : "ghost"}
          className="w-full justify-start"
        >
          <span className="mr-2 text-lg">{getSportIcon(sport)}</span>
          <span>{sport}</span>
        </Button>
      ))}
    </div>
  );
};

export default SportFilter;
