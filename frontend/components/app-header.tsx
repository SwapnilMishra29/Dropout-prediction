"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm px-6 sticky top-0 z-10">
      <div className="animate-fade-in">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search..."
            className="w-64 bg-secondary/50 pl-9 border-border/50 rounded-xl h-9 text-sm placeholder:text-muted-foreground/60 focus:bg-card focus:border-primary/30 transition-all duration-200"
          />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-xl hover:bg-secondary/80 transition-all duration-200"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white shadow-sm animate-scale-in">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
