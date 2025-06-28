"use client";

import React from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "./ui/popover";
import type { Filter, Category } from "./FilterButtons";

// helper: format Date to YYYY-MM-DD
const getISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;

type FilterDropdownProps = {
    categories: Category[];
    filter: Filter;
    onFilterChange: (f: Filter) => void;
};

export default function FilterDropdown({
                                           categories,
                                           filter,
                                           onFilterChange,
                                       }: FilterDropdownProps) {
    // 날짜 계산
    const today = new Date();
    const todayISO = getISODate(today);

    // 이번 주: 월요일~금요일
    const weekStartISO = (() => {
        const d = new Date();
        const day = d.getDay(); // 0(일)~6
        const mondayOffset = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + mondayOffset);
        return getISODate(d);
    })();
    const weekEndISO = (() => {
        const [y, m, dd] = weekStartISO.split("-").map(Number);
        const d = new Date(y, m - 1, dd);
        d.setDate(d.getDate() + 4); // 월요일+4=금요일
        return getISODate(d);
    })();

    // 이번 달: 1일~말일
    const monthStartISO = (() => {
        const d = new Date();
        d.setDate(1);
        return getISODate(d);
    })();
    const monthEndISO = (() => {
        const d = new Date();
        const nm = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        nm.setDate(nm.getDate() - 1);
        return getISODate(nm);
    })();

    // 핸들러
    const handleCategoryChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
        onFilterChange({ ...filter, categories: selected });
    };
    const handleRangeChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        let start: string | undefined;
        let end: string | undefined;
        if (e.target.value === "heute") {
            start = todayISO;
            end = todayISO;
        } else if (e.target.value === "woche") {
            start = weekStartISO;
            end = weekEndISO;
        } else if (e.target.value === "monat") {
            start = monthStartISO;
            end = monthEndISO;
        } else {
            start = undefined;
            end = undefined;
        }
        onFilterChange({ ...filter, start, end });
    };
    const handleClientChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        onFilterChange({ ...filter, client: e.target.value || undefined });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="btn-main">
                    Filter Optionen
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-72 bg-[#222b46] border border-[#263754] rounded-lg p-4 shadow-lg"
            >
                <div className="flex flex-col gap-4">
                    {/* Kategorie */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Kategorie
                        </label>
                        <select
                            multiple
                            className="form-multiselect block w-full bg-[#111827] text-white p-2 rounded border border-[#374151] focus:ring-2 focus:ring-[#38b6ff]/50"
                            value={filter.categories}
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Zeitraum
                        </label>
                        <select
                            className="block w-full bg-[#111827] text-white p-2 rounded border border-[#374151] focus:ring-2 focus:ring-[#a259df]/50"
                            value={
                                filter.start && filter.end
                                    ? filter.start === filter.end
                                        ? "heute"
                                        : filter.start === weekStartISO && filter.end === weekEndISO
                                            ? "woche"
                                            : filter.start === monthStartISO && filter.end === monthEndISO
                                                ? "monat"
                                                : "alles"
                                    : "alles"
                            }
                            onChange={handleRangeChange}
                        >
                            <option value="heute">Heute</option>
                            <option value="woche">Diese Woche</option>
                            <option value="monat">Diesen Monat</option>
                            {/*<option value="alles">Alles</option>*/}
                        </select>
                    </div>

                    {/* Klient:in */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Klient:in
                        </label>
                        <input
                            type="text"
                            placeholder="Name eingeben"
                            className="block w-full bg-[#111827] text-white p-2 rounded border border-[#374151] focus:ring-2 focus:ring-[#38b6ff]/50"
                            value={filter.client || ""}
                            onChange={handleClientChange}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
