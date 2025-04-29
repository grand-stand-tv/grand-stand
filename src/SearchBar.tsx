import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onSearch: (term: string) => void;
}

const SearchBar = ({ value, onSearch }: SearchBarProps) => {
  const [searchInput, setSearchInput] = useState(value || "");

  // Update local state when prop changes
  useEffect(() => {
    setSearchInput(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search events..."
          className="pl-8 bg-background w-full"
        />
      </div>
    </form>
  );
};

export default SearchBar;
