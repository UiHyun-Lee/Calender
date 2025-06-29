"use client";
import React, { useState, useEffect } from "react";
import type { Category } from "./FilterButtons";

// Props for the EditEventModal component
type EditEventModalProps = {
    open: boolean;
    event: any;
    categories: Category[];
    onUpdate: (data: any) => void;
    onDelete: () => void;
    onClose: () => void;
};

export default function EditEventModal({open, event, categories, onUpdate, onDelete, onClose,}: EditEventModalProps) {

    // State for form fields
    const [title, setTitle] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [category, setCategory] = useState("");
    const [notes, setNotes] = useState("");

    // Update form fields when event changes
    useEffect(() => {
        if (event) {
            setTitle(event.title || "");
            setStart(event.start || event.startStr || "");
            setEnd(event.end || event.endStr || "");
            setCategory(event.category || event.extendedProps?.category || "");
            setNotes(event.notes || event.extendedProps?.notes || "");
        }
    }, [event]);

    // Do not render modal if not open or no event
    if (!open || !event) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="
            min-w-[350px] w-full max-w-md flex flex-col gap-4 border
            p-8 rounded-2xl shadow-2xl
            bg-gray-50 text-gray-900 border-gray-300
            dark:bg-[#222b46] dark:text-gray-100 dark:border-[#263754]
            transition
        ">
                {/* Modal header with title and close button */}
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold">Termin bearbeiten</span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black dark:hover:text-white text-2xl transition"
                        aria-label="Schließen"
                    >
                        &times;
                    </button>
                </div>
                {/* Title input */}
                <input
                    className="input-modal"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                {/* Start date input */}
                <input
                    type="datetime-local"
                    className="input-modal"
                    value={start?.slice(0, 16)}
                    onChange={e => setStart(e.target.value)}
                />
                {/* End date input */}
                <input
                    type="datetime-local"
                    className="input-modal"
                    value={end?.slice(0, 16)}
                    onChange={e => setEnd(e.target.value)}
                />
                {/* Category select */}
                <select
                    className="input-modal"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    <option value="">(keine Kategorie)</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                </select>
                {/* Notes textarea */}
                <textarea
                    className="input-modal"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                />
                {/* Action buttons */}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => onUpdate({ title, start, end, category, notes })}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#a259df] to-[#38b6ff] text-white font-bold shadow hover:scale-105 hover:opacity-90 transition">
                        Speichern
                    </button>

                    <button
                        onClick={onDelete}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-700 shadow transition">
                        Löschen
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-gray-300 text-gray-900 font-bold hover:bg-gray-400 dark:bg-gray-400 dark:text-white dark:hover:bg-gray-500 shadow transition">
                        Abbrechen
                    </button>
                </div>
            </div>
        </div>
    );

}