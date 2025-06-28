"use client";

import React, { useState, useEffect } from "react";

export type EventModalProps = {
    open: boolean;
    onCloseAction: () => void;
    onAddAction: (event: {
        title: string;
        start: string;
        end: string;
        notes: string;
        firstname: string;
        lastname: string;
        category: string;
    }) => void;
    categories: { id: string; label: string; color: string }[];
};

export default function EventModal({ open, onCloseAction, onAddAction, categories }: EventModalProps) {
    const [title, setTitle] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [notes, setNotes] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [category, setCategory] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Reset form on close
    useEffect(() => {
        if (!open) {
            setTitle("");
            setStart("");
            setEnd("");
            setFirstname("");
            setLastname("");
            setCategory("");
            setNotes("");
            setError(null);
        }
    }, [open]);

    // Only letters for names
    const handleFirstnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^[A-Za-z]*$/.test(val)) {
            setFirstname(val);
        }
    };
    const handleLastnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^[A-Za-z]*$/.test(val)) {
            setLastname(val);
        }
    };

    const handleAdd = () => {
        setError(null);
        // Required fields
        if (!title || !start || !firstname || !lastname || !category) {
            setError("Alle Pflichtfelder ausfüllen.");
            return;
        }
        // Date validation
        if (end && new Date(start) > new Date(end)) {
            setError("Das Enddatum muss nach dem Startdatum liegen.");
            return;
        }
        onAddAction({ title, start, end, notes, firstname, lastname, category });
        onCloseAction();
    };

    if (!open) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="bg-[#222b46] p-6 rounded-lg shadow-xl min-w-[340px] flex flex-col gap-3 border border-[#263754]">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg text-white">Neuer Termin</h2>
                    <button onClick={onCloseAction} className="text-gray-400 text-xl hover:text-white">
                        &times;
                    </button>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <input
                    placeholder="Titel"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded px-3 py-2 bg-[#233858] text-white border border-[#263754]"
                />
                <input
                    placeholder="Vorname"
                    value={firstname}
                    onChange={handleFirstnameChange}
                    className="rounded px-3 py-2 bg-[#233858] text-white border border-[#263754]"
                />
                <input
                    placeholder="Nachname"
                    value={lastname}
                    onChange={handleLastnameChange}
                    className="rounded px-3 py-2 bg-[#233858] text-white border border-[#263754]"
                />

                <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="rounded px-3 py-2 bg-[#233858] text-white border border-[#263754]"
                />
                <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="rounded px-3 py-2 bg-[#233858] text-white border border-[#263754]"
                />
                <input
                    placeholder="Notizen"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="rounded px-3 py-2 bg-[#233858] text-white border border-[#263754]"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded px-3 py-2 bg-[#233858] text-white border border-[#263754]"
                >
                    <option value="">Kategorie wählen</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>

                <button
                    onClick={handleAdd}
                    className="bg-gradient-to-r from-[#a259df] to-[#38b6ff] text-white font-bold py-2 rounded-xl hover:opacity-90 transition"
                >
                    Hinzufügen
                </button>
            </div>
        </div>
    );
}
