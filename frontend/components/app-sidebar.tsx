"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Academic Records", href: "/academic", icon: GraduationCap },
  { name: "Finance Records", href: "/finance", icon: Wallet },
  { name: "Predictions", href: "/predictions", icon: TrendingUp },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Upload CSV", href: "/upload", icon: Upload },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-64 flex flex-col 
                 bg-gradient-to-b from-sidebar via-sidebar to-[oklch(0.08_0.02_260)]
                 border-r border-sidebar-border/50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-[oklch(0.6_0.15_280)] shadow-lg shadow-sidebar-primary/25">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          EduPredict
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{ animationDelay: `${index * 50}ms` }}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 animate-fade-in",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-white shadow-md shadow-sidebar-primary/30"
                      : "bg-sidebar-accent/50 text-sidebar-foreground/60 group-hover:bg-sidebar-accent group-hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-scale-in" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-sidebar-accent/80 to-sidebar-accent/40 p-4 backdrop-blur-sm border border-sidebar-border/30">
          <p className="text-xs font-medium text-sidebar-foreground/80">
            Student Dropout Prediction
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/50">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
