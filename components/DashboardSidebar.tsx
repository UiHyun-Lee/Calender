"use client";

import React, { useMemo } from "react";
import type { Appointment } from "../types";
import { CalendarDays, Sun, Moon, ScrollText, RotateCcw } from "lucide-react";

// Props for the DashboardSidebar component
export type DashboardSidebarProps = {
    events: Appointment[];
    onToggleCalendarTheme: () => void;
    onRefresh?: () => void;
    theme: "light" | "dark";
};

export default function DashboardSidebar({ events, onToggleCalendarTheme, onRefresh, theme }: DashboardSidebarProps) {
    const now = new Date();

// 1. Count of active (future or ongoing) events
    const activeCount = events.filter(e => {
        const start = new Date(e.start);
        const end = e.end ? new Date(e.end) : null;
        if (end) return end >= now;
        return start >= now;
    }).length;

// 2. Next upcoming (future or ongoing) event
    const nextEvent = useMemo(() => {
        const filtered = events.filter(e => {
            const start = new Date(e.start);
            const end = e.end ? new Date(e.end) : null;
            if (end) return end >= now;
            return start >= now;
        });
        return (
            filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] || null
        );
    }, [events, now]);

// 3. Count of active events with notes
    const notesCount = useMemo(() => {
        return events.filter(e => {
            const start = new Date(e.start);
            const end = e.end ? new Date(e.end) : null;
            const hasNotes = typeof e.notes === "string" && e.notes.trim() !== "";
            if (!hasNotes) return false;
            if (end) return end >= now;
            return start >= now;
        }).length;
    }, [events, now]);

// 4. Next upcoming active event with notes
    const nextNotesEvent = useMemo(() => {
        const filtered = events.filter(e => {
            const start = new Date(e.start);
            const end = e.end ? new Date(e.end) : null;
            const hasNotes = typeof e.notes === "string" && e.notes.trim() !== "";
            if (!hasNotes) return false;
            if (end) return end >= now;
            return start >= now;
        });
        return (
            filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0] || null
        );
    }, [events, now]);


    return (
        <div className="dashboard-sidebar space-y-6 p-4 h-full">

            {/* Theme toggle & Refresh button */}
            <div className="flex justify-between items-center">
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
                {onRefresh && (
                    <button
                        aria-label="Reload"
                        onClick={onRefresh}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:opacity-80 transition-all ml-2"
                        title="Reload"
                    >
                        <RotateCcw size={20} />
                    </button>
                )}
            </div>

            {/* Header */}
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <CalendarDays size={20} />
                <h2 className="text-xl font-bold">Information</h2>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                {/* Active events */}
                <div className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                    <CalendarDays size={24} />
                    <div className="text-right">
                        <div className="text-2xl font-semibold">
                            {activeCount}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Aktive Termine
                        </div>
                    </div>
                </div>

                {/* Next event */}
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Nächster Termin:
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
                            Keine anstehenden Termine
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                {/* Important notes */}
                <div className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                    <ScrollText size={24} />
                    <div className="text-right">
                        <div className="text-2xl font-semibold">
                            {notesCount}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Notizen
                        </div>
                    </div>
                </div>

                {/* Next note */}
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Nächster Notizen:
                    </div>
                    {nextNotesEvent ? (
                        <>
                            <div className="font-medium">
                                {nextNotesEvent.notes}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                                {new Date(nextNotesEvent.start).toLocaleString(
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
                            Keine anstehenden Notizen
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}