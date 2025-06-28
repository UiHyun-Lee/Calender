"use client";

import React, { useMemo } from "react";
import type { Appointment } from "../types";
import { CalendarDays, Bell, Sun, Moon } from "lucide-react";

export type DashboardSidebarProps = {
    events: Appointment[];
    onToggleCalendarTheme: () => void;
    theme: "light" | "dark";
};

export default function DashboardSidebar({
                                             events,
                                             onToggleCalendarTheme,
                                             theme,
                                         }: DashboardSidebarProps) {
    const now = useMemo(() => new Date(), []);
    const activeCount = events.length;

    const nextEvent = useMemo(() => {
        return (
            events
                .filter((e) => new Date(e.start) > now)
                .sort(
                    (a, b) =>
                        new Date(a.start).getTime() -
                        new Date(b.start).getTime()
                )[0] || null
        );
    }, [events, now]);

    const importantCount = useMemo(
        () => events.filter((e) => e.category === "important").length,
        [events]
    );

    return (
        <div className="dashboard-sidebar space-y-6 p-4 h-full">
            {/* Theme toggle button */}
            <div className="flex justify-end">
                <button
                    aria-label="Toggle theme"
                    onClick={onToggleCalendarTheme}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:opacity-80 transition-all"
                >
                    {theme === "dark" ? (
                        <Sun size={20} className="text-yellow-400" />
                    ) : (
                        <Moon size={20} className="text-blue-800" />
                    )}
                </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <CalendarDays size={20} />
                <h2 className="text-xl font-bold">Information</h2>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                {/* Active Events */}
                <div className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                    <CalendarDays size={24} />
                    <div className="text-right">
                        <div className="text-2xl font-semibold">
                            {activeCount}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Active Events
                        </div>
                    </div>
                </div>

                {/* Important */}
                <div className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                    <Bell size={24} />
                    <div className="text-right">
                        <div className="text-2xl font-semibold">
                            {importantCount}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Important
                        </div>
                    </div>
                </div>

                {/* Next Event */}
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Next Event:
                    </div>
                    {nextEvent ? (
                        <>
                            <div className="font-medium">
                                {nextEvent.title}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                                {new Date(nextEvent.start).toLocaleString(
                                    "de-DE",
                                    {
                                        weekday: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-sm italic text-gray-500 dark:text-gray-400">
                            No upcoming events
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
