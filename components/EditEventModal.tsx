"use client";
import React, { useState, useEffect } from "react";
import type { Category } from "./FilterButtons";

type EditEventModalProps = {
    open: boolean;
    event: any;
    categories: Category[];
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onClose: () => void;
};

export default function EditEventModal({
                                           open,
                                           event,
                                           categories,
                                           onUpdate,
                                           onDelete,
                                           onClose,
                                       }: EditEventModalProps) {
    const [title, setTitle] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [category, setCategory] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (event) {
            setTitle(event.title || "");
            setStart(event.start || event.startStr || "");
            setEnd(event.end || event.endStr || "");
            setCategory(event.category || event.extendedProps?.category || "");
            setNotes(event.notes || event.extendedProps?.notes || "");
        }
    }, [event]);

    if (!open || !event) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#222b46] p-8 rounded-2xl shadow-2xl min-w-[350px] w-full max-w-md border border-[#263754] flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold text-white">Termin bearbeiten</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <input
                    className="w-full p-2 rounded-lg bg-[#111827] border border-[#374151] text-white focus:ring-2 focus:ring-[#38b6ff]/60"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <input
                    type="datetime-local"
                    className="w-full p-2 rounded-lg bg-[#111827] border border-[#374151] text-white focus:ring-2 focus:ring-[#38b6ff]/60"
                    value={start?.slice(0, 16)}
                    onChange={e => setStart(e.target.value)}
                />
                <input
                    type="datetime-local"
                    className="w-full p-2 rounded-lg bg-[#111827] border border-[#374151] text-white focus:ring-2 focus:ring-[#38b6ff]/60"
                    value={end?.slice(0, 16)}
                    onChange={e => setEnd(e.target.value)}
                />
                <select
                    className="w-full p-2 rounded-lg bg-[#111827] border border-[#374151] text-white focus:ring-2 focus:ring-[#a259df]/60"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    <option value="">(keine Kategorie)</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>
                <textarea
                    className="w-full p-2 rounded-lg bg-[#111827] border border-[#374151] text-white focus:ring-2 focus:ring-[#38b6ff]/60"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                />
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => onUpdate({ title, start, end, category, notes })}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a259df] to-[#38b6ff] text-white font-bold shadow hover:scale-105 hover:opacity-90 transition"
                    >
                        Speichern
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-700 shadow transition"
                    >
                        Löschen
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-gray-400 text-white font-bold hover:bg-gray-500 shadow transition"
                    >
                        Abbrechen
                    </button>
                </div>
            </div>
        </div>
    );
}
