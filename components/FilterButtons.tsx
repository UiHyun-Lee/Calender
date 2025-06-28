"use client";

import React, { useState } from "react";
import {
    getTodayISO,
    getWeekStartEndISO,
    getMonthStartEndISO,
} from "../lib/dateUtils";

export type Filter = {
    categories: string[];
    start?: string;
    end?: string;
    client?: string;
};

export type Category = { id: string; label: string; color: string };

type FilterButtonsProps = {
    categories: Category[];
    onFilterChangeAction: (f: Filter) => void;
};

export default function FilterButtons({categories, onFilterChangeAction,}: FilterButtonsProps) {

    const [selCats, setSelCats] = useState<string[]>([]);
    const [range, setRange] = useState<{ start?: string; end?: string }>({});
    const [client, setClient] = useState<string>("");

    const todayISO = getTodayISO();
    const { start: weekStartISO, end: weekEndISO } = getWeekStartEndISO();
    const { start: monthStartISO, end: monthEndISO } = getMonthStartEndISO();

    const toggleCat = (id: string) =>
        setSelCats((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const applyFilter = () => {
        onFilterChangeAction({
            categories: selCats,
            start: range.start,
            end: range.end,
            client: client || undefined,
        });
    };

    const resetFilter = () => {
        setSelCats([]);
        setRange({});
        setClient("");
    };

    return (
        <div className="
            flex flex-col gap-4
            p-6 rounded-2xl shadow-xl
            bg-gray-50 dark:bg-[#233858]
            text-gray-900 dark:text-gray-100
            min-w-[320px] max-w-[90vw]
        ">

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelCats([])}
                    className={`
                        px-3 py-1 rounded-full transition
                        ${selCats.length === 0
                        ? "bg-white text-black dark:bg-gray-700 dark:text-white"
                        : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"}
                    `}
                >
                    Alle
                </button>
                {categories.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => toggleCat(c.id)}
                        className={`
                            px-3 py-1 rounded-full transition
                            ${selCats.includes(c.id)
                            ? "bg-white text-black dark:bg-gray-700 dark:text-white"
                            : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"}
                        `}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Zeitraum */}
            <div className="flex gap-2">
                <button
                    onClick={() => setRange({ start: todayISO, end: todayISO })}
                    className={`
                        px-3 py-1 rounded-md transition
                        ${range.start === todayISO && range.end === todayISO
                        ? "bg-white text-black dark:bg-gray-700 dark:text-white"
                        : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"}
                    `}
                >
                    Heute
                </button>
                <button
                    onClick={() => setRange({ start: weekStartISO, end: weekEndISO })}
                    className={`
                        px-3 py-1 rounded-md transition
                        ${range.start === weekStartISO && range.end === weekEndISO
                        ? "bg-white text-black dark:bg-gray-700 dark:text-white"
                        : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"}
                    `}
                >
                    Diese Woche
                </button>
                <button
                    onClick={() => setRange({ start: monthStartISO, end: monthEndISO })}
                    className={`
                        px-3 py-1 rounded-md transition
                        ${range.start === monthStartISO && range.end === monthEndISO
                        ? "bg-white text-black dark:bg-gray-700 dark:text-white"
                        : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"}
                    `}
                >
                    Diesen Monat
                </button>
                <button
                    onClick={() => setRange({})}
                    className={`
                        px-3 py-1 rounded-md transition
                        ${!range.start && !range.end
                        ? "bg-white text-black dark:bg-gray-700 dark:text-white"
                        : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white"}
                    `}
                >
                    Alles
                </button>
            </div>

            {/* Klient:in */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Klient:in"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="
                        flex-1
                        bg-gray-100 text-gray-900
                        dark:bg-[#162841] dark:text-gray-100
                        px-3 py-1 rounded border border-gray-300 dark:border-[#263754]
                        transition
                    "
                />
            </div>

            {/* Aktion 버튼 */}
            <div className="flex justify-end gap-2 mt-2">
                <button
                    onClick={resetFilter}
                    className="
                        px-4 py-1
                        bg-gray-300 text-gray-900
                        dark:bg-gray-600 dark:text-white
                        rounded-md transition
                    "
                >
                    Zurücksetzen
                </button>
                <button
                    onClick={applyFilter}
                    className="
                        px-4 py-1
                        bg-gradient-to-r from-[#a259df] to-[#38b6ff] text-white
                        rounded-md transition
                    "
                >
                    Filtern
                </button>
            </div>
        </div>
    );
}
