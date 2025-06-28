"use client";

import React, { useMemo } from "react";
import type { Appointment } from "../types";
import { CalendarDays, Sun, Moon, ScrollText, RotateCcw } from "lucide-react";

export type DashboardSidebarProps = {
    events: Appointment[];
    onToggleCalendarTheme: () => void;
    onRefresh?: () => void; // 새로고침 콜백 추가!
    theme: "light" | "dark";
};

export default function DashboardSidebar({
                                             events,
                                             onToggleCalendarTheme,
                                             onRefresh,
                                             theme,
                                         }: DashboardSidebarProps) {
    const now = new Date();
    const activeCount = events.filter(e => new Date(e.start) > now).length;

    const nextEvent = useMemo(() => {
        return (
            events
                .filter((e) => new Date(e.start) > now)
                .sort(
                    (a, b) =>
                        new Date(a.start).getTime() - new Date(b.start).getTime()
                )[0] || null
        );
    }, [events, now]);

    const notesCount = useMemo(
        () => events.filter(e => e.notes && e.notes.trim() !== "").length,
        [events]
    );

    const nextNotesEvent = useMemo(() => {
        return (
            events
                .filter(
                    e =>
                        new Date(e.start) > now &&
                        typeof e.notes === "string" &&
                        e.notes.trim() !== ""
                )
                .sort((a, b) => {
                    const aTime = a.start ? new Date(a.start).getTime() : 0;
                    const bTime = b.start ? new Date(b.start).getTime() : 0;
                    return aTime - bTime;
                })[0] || null
        );
    }, [events, now]);

    return (
        <div className="dashboard-sidebar space-y-6 p-4 h-full">

            {/* Theme toggle & Refresh buttons */}
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
                        aria-label="새로고침"
                        onClick={onRefresh}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-600 hover:opacity-80 transition-all ml-2"
                        title="새로고침"
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
                {/* Active Events */}
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

                {/* Next Event */}
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
                            Keine bevorstehenden Termine
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                {/* Important */}
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

                {/* Next Notes */}
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Nächste Notizen:
                    </div>
                    {nextNotesEvent ? (
                        <>
                            <div className="font-medium">
                                {nextNotesEvent.title}
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
                            No upcoming notes events
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
