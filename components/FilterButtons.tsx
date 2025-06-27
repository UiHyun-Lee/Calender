"use client";

import React, { useState, useEffect } from "react";

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

// 날짜 계산
const todayISO = new Date().toISOString().slice(0, 10);

const weekStartISO = (() => {
    const d = new Date();
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
})();
const weekEndISO = (() => {
    const [y, m, dd] = weekStartISO.split("-").map(Number);
    const d = new Date(y, m - 1, dd);
    d.setDate(d.getDate() + 4);
    return d.toISOString().slice(0, 10);
})();
const monthStartISO = (() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
})();
const monthEndISO = (() => {
    const d = new Date();
    const nm = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    nm.setDate(nm.getDate() - 1);
    return nm.toISOString().slice(0, 10);
})();

export default function FilterButtons({
                                          categories,
                                          onFilterChangeAction,
                                      }: FilterButtonsProps) {
    const [selCats, setSelCats] = useState<string[]>([]);
    const [range, setRange] = useState<{ start?: string; end?: string }>({});
    const [client, setClient] = useState<string>("");

    useEffect(() => {
        onFilterChangeAction({
            categories: selCats,
            start: range.start,
            end: range.end,
            client: client || undefined,
        });
    }, [selCats, range, client, onFilterChangeAction]);

    const toggleCat = (id: string) =>
        setSelCats((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    return (
        <div className="flex flex-col gap-4">
            {/* 카테고리 */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelCats([])}
                    className={`px-3 py-1 rounded-full ${
                        selCats.length === 0 ? "bg-white text-black" : "bg-gray-700 text-white"
                    }`}
                >
                    Alle
                </button>
                {categories.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => toggleCat(c.id)}
                        className={`px-3 py-1 rounded-full ${
                            selCats.includes(c.id) ? "bg-white text-black" : "bg-gray-700 text-white"
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Zeitraum */}
            <div className="flex gap-2">
                <button
                    onClick={() => setRange({ start: todayISO, end: todayISO })}
                    className={`px-3 py-1 rounded-md ${
                        range.start === todayISO && range.end === todayISO
                            ? "bg-white text-black"
                            : "bg-gray-700 text-white"
                    }`}
                >
                    Heute
                </button>
                <button
                    onClick={() => setRange({ start: weekStartISO, end: weekEndISO })}
                    className={`px-3 py-1 rounded-md ${
                        range.start === weekStartISO && range.end === weekEndISO
                            ? "bg-white text-black"
                            : "bg-gray-700 text-white"
                    }`}
                >
                    Diese Woche
                </button>
                <button
                    onClick={() => setRange({ start: monthStartISO, end: monthEndISO })}
                    className={`px-3 py-1 rounded-md ${
                        range.start === monthStartISO && range.end === monthEndISO
                            ? "bg-white text-black"
                            : "bg-gray-700 text-white"
                    }`}
                >
                    Diesen Monat
                </button>
                <button
                    onClick={() => setRange({})}
                    className={`px-3 py-1 rounded-md ${
                        !range.start && !range.end
                            ? "bg-white text-black"
                            : "bg-gray-700 text-white"
                    }`}
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
                    className="flex-1 bg-[#233858] text-white px-3 py-1 rounded border border-[#263754]"
                />
                <button
                    onClick={() => {}}
                    className="px-4 py-1 bg-gradient-to-r from-[#a259df] to-[#38b6ff] text-white rounded-md"
                >
                    Filtern
                </button>
            </div>
        </div>
    );
}
