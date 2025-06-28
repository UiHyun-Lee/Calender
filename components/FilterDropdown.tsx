"use client";

import React, { useEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { getTodayISO, getWeekStartEndISO, getMonthStartEndISO } from "../lib/dateUtils";
import type { Filter, Category } from "./FilterButtons";
import { Funnel } from "lucide-react";

// "clientList"는 [{id, firstname, lastname}] 형태여야 함
type FilterDropdownProps = {
    categories: Category[];
    filter: Filter;
    onFilterChange: (f: Filter) => void;
    clientList: { id: string; firstname: string; lastname: string }[];
};

export default function FilterDropdown({ categories, filter, onFilterChange, clientList }: FilterDropdownProps) {
    const todayISO = getTodayISO();
    const { start: weekStartISO, end: weekEndISO } = getWeekStartEndISO();
    const { start: monthStartISO, end: monthEndISO } = getMonthStartEndISO();

    const [open, setOpen] = useState(false);
    const [localFilter, setLocalFilter] = useState<Filter>(filter);

    useEffect(() => {
        setLocalFilter(filter);
    }, [filter]);

    // 카테고리 즉시 반영
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
        const newFilter = { ...localFilter, categories: selected };
        setLocalFilter(newFilter);
        onFilterChange(newFilter);
    };

    // 기간 즉시 반영
    const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        let start: string | undefined;
        let end: string | undefined;
        switch (e.target.value) {
            case "heute":
                start = todayISO;
                end = todayISO;
                break;
            case "woche":
                start = weekStartISO;
                end = weekEndISO;
                break;
            case "monat":
                start = monthStartISO;
                end = monthEndISO;
                break;
            default:
                start = undefined;
                end = undefined;
        }
        const newFilter = { ...localFilter, start, end };
        setLocalFilter(newFilter);
        onFilterChange(newFilter);
    };

    // 환자 즉시 반영 (id로!)
    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const client = e.target.value || undefined;
        const newFilter = { ...localFilter, client };
        setLocalFilter(newFilter);
        onFilterChange(newFilter);
    };

    const resetFilter = () => {
        const newFilter: Filter = { categories: [], start: undefined, end: undefined, client: undefined };
        setLocalFilter(newFilter);
        onFilterChange(newFilter);
    };

    const applyFilter = () => {
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="btn-main group flex items-center justify-center relative min-w-[44px]">
                    <span className="block group-hover:hidden transition-all">
                        <Funnel />
                    </span>
                    <span className="hidden group-hover:inline transition-all whitespace-nowrap">
                        Filter
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="relative w-72 bg-gray-50 text-gray-900 border border-gray-300 dark:bg-[#222b46] dark:text-gray-100 dark:border-[#263754] rounded-lg p-4 shadow-lg"
            >
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-black dark:hover:text-white"
                    aria-label="Schließen"
                >
                    &times;
                </button>
                <div className="flex flex-col gap-4">
                    {/* Kategorie */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300">
                            Kategorie
                        </label>
                        <select
                            multiple
                            className="form-multiselect block w-full bg-gray-100 text-gray-900 border border-gray-300 dark:bg-[#111827] dark:text-gray-100 dark:border-[#374151] p-2 rounded focus:ring-2 focus:ring-[#38b6ff]/50 transition"
                            value={localFilter.categories}
                            onChange={handleCategoryChange}
                        >
                            <option value="all">Alle</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Zeitraum */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300">
                            Zeitraum
                        </label>
                        <select
                            className="block w-full bg-gray-100 text-gray-900 border border-gray-300 dark:bg-[#111827] dark:text-gray-100 dark:border-[#374151] p-2 rounded focus:ring-2 focus:ring-[#a259df]/50 transition"
                            value={
                                localFilter.start && localFilter.end
                                    ? localFilter.start === localFilter.end
                                        ? "heute"
                                        : localFilter.start === weekStartISO && localFilter.end === weekEndISO
                                            ? "woche"
                                            : localFilter.start === monthStartISO && localFilter.end === monthEndISO
                                                ? "monat"
                                                : ""
                                    : ""
                            }
                            onChange={handleRangeChange}
                        >
                            <option value="heute">Heute</option>
                            <option value="woche">Diese Woche</option>
                            <option value="monat">Diesen Monat</option>
                        </select>
                    </div>
                    {/* Klient:in */}
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-800 dark:text-gray-300">
                            Klient:in
                        </label>
                        <select
                            className="block w-full bg-gray-100 text-gray-900 border border-gray-300 dark:bg-[#111827] dark:text-gray-100 dark:border-[#374151] p-2 rounded focus:ring-2 focus:ring-[#38b6ff]/50 transition"
                            value={localFilter.client || ""}
                            onChange={handleClientChange}
                        >
                            <option value="">Alle</option>
                            {clientList.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.firstname} {client.lastname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={resetFilter}
                            className="px-4 py-1 bg-gray-300 text-gray-900 dark:bg-gray-600 dark:text-white rounded-md transition"
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
                            Anwenden
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

