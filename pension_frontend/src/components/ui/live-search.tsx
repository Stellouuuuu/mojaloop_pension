import { useState, useEffect, useRef, useCallback } from "react";
import { Search, User, CreditCard, Loader2 } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "pensioner" | "payment";
  title: string;
  subtitle: string;
}

// Simulated search data
const mockData: SearchResult[] = [
  { id: "1", type: "pensioner", title: "Kokou Mensah", subtitle: "BN-2024-00145" },
  { id: "2", type: "pensioner", title: "Adjovi Dossou", subtitle: "BN-2024-00892" },
  { id: "3", type: "pensioner", title: "Akpaki Houessou", subtitle: "BN-2024-01234" },
  { id: "4", type: "pensioner", title: "Sossou Agbangla", subtitle: "BN-2024-00567" },
  { id: "5", type: "payment", title: "Paiement #28471", subtitle: "85,000 XOF - Réussi" },
  { id: "6", type: "payment", title: "Paiement #28472", subtitle: "120,000 XOF - En cours" },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function LiveSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const filtered = mockData.filter(
      item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setResults(filtered);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case "Enter":
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    console.log("Selected:", result);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Rechercher un pensionné, ID..."
          className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-1"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevated overflow-hidden z-50 animate-fade-in">
          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((result, index) => (
                <li
                  key={result.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
                    index === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                  )}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    result.type === "pensioner" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
                  )}>
                    {result.type === "pensioner" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : query && !isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Aucun résultat pour "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
