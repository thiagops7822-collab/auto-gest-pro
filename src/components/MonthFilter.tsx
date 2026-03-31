import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface MonthFilterProps {
  value: string; // "YYYY-MM"
  onChange: (value: string) => void;
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(value: string) {
  const [year, month] = value.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

export function filterByMonth<T>(items: T[], dateField: keyof T, month: string): T[] {
  return items.filter(item => {
    const date = String(item[dateField] || '');
    return date.startsWith(month);
  });
}

export default function MonthFilter({ value, onChange }: MonthFilterProps) {
  const [yearStr, monthStr] = value.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const goBack = () => {
    const d = new Date(year, month - 2, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const goForward = () => {
    const d = new Date(year, month, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleMonthChange = (m: string) => {
    onChange(`${yearStr}-${m}`);
  };

  const handleYearChange = (y: string) => {
    onChange(`${y}-${monthStr}`);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-muted-foreground">
        <CalendarDays className="w-4 h-4" />
        <span className="text-xs font-medium hidden sm:inline">Período:</span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goBack}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Select value={monthStr} onValueChange={handleMonthChange}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTH_NAMES.map((name, i) => (
              <SelectItem key={i} value={String(i + 1).padStart(2, '0')}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearStr} onValueChange={handleYearChange}>
          <SelectTrigger className="h-8 w-[80px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goForward}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
