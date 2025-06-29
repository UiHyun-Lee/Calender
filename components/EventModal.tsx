"use client";

import React, { useState, useEffect } from "react";

// Props for the EventModal component
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
    // State for form fields
    const [title, setTitle] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [notes, setNotes] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [category, setCategory] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal closes
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

    // Only allow letters for firstname
    const handleFirstnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^[A-Za-z]*$/.test(val)) {
            setFirstname(val);
        }
        else {
            setError("Der Name darf nur mit einem Buchstaben des Alphabets beginnen.");
            return;
        }
    };
    // Only allow letters for lastname
    const handleLastnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^[A-Za-z]*$/.test(val)) {
            setLastname(val);
        }
        else {
            setError("Der Name darf nur mit einem Buchstaben des Alphabets beginnen.");
            return;
        }
    };

    // Handle add event action
    const handleAdd = () => {
        setError(null);
        // Validate required fields
        if (!title || !start || !firstname || !lastname || !category) {
            setError("Alle Pflichtfelder ausfüllen.");
            return;
        }
        // Validate date order
        if (end && new Date(start) > new Date(end)) {
            setError("Das Enddatum muss nach dem Startdatum liegen.");
            return;
        }
        onAddAction({title, start, end, notes, firstname, lastname, category});
        onCloseAction();
    };

    // Do not render modal if not open
    if (!open) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
            <div className="
            min-w-[340px] flex flex-col gap-3 border
            p-6 rounded-lg shadow-xl
            bg-gray-50 text-gray-900 border-gray-300
            dark:bg-[#222b46] dark:text-gray-100 dark:border-[#263754]
            transition
        ">
                {/* Modal header with title and close button */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg">Neuer Termin</h2>
                    <button
                        onClick={onCloseAction}
                        className="text-gray-400 text-xl hover:text-black dark:hover:text-white transition"
                        aria-label="Schließen">
                        &times;
                    </button>
                </div>

                {/* Error message */}
                {error && <div className="text-red-500 text-sm">{error}</div>}

                {/* Title input */}
                <input
                    placeholder="Titel"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-base"
                />
                {/* Firstname input */}
                <input
                    placeholder="Vorname"
                    value={firstname}
                    onChange={handleFirstnameChange}
                    className="input-base"
                />
                {/* Lastname input */}
                <input
                    placeholder="Nachname"
                    value={lastname}
                    onChange={handleLastnameChange}
                    className="input-base"
                />

                {/* Start date input */}
                <input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="input-base"
                />
                {/* End date input */}
                <input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="input-base"
                />
                {/* Notes input */}
                <input
                    placeholder="Notizen"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-base"
                />
                {/* Category select */}
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="
                    input-base">
                    <option value="">Kategorie wählen</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>

                {/* Add button */}
                <button
                    onClick={handleAdd}
                    className="px-3 py-1 bg-gradient-to-r from-[#a259df] to-[#38b6ff] text-white rounded-xl shadow hover:scale-105 hover:opacity-90 transition">
                    Hinzufügen
                </button>
            </div>
        </div>
    );
}