"use client";

import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">

      {/* Sidebar (fixed) */}
      <AppSidebar />

      {/* Main scrollable area */}
      <main className="flex-1 h-screen overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>

    </div>
  );
}