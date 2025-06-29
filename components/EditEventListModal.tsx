"use client";
import React from "react";
import type {Category} from "./FilterButtons";

// Event type definition
type EventType = {
    id: string;
    title: string;
    start: string;
    end: string;
    category?: string;
};

// Props for the EditEventListModal component
type EditEventListModalProps = {
    open: boolean;
    events: EventType[];
    categories: Category[];
    onEdit: (event: EventType) => void;
    onDelete: (event: EventType) => void | Promise<void>;
    onClose: () => void;
};

export default function EditEventListModal({open, events, categories, onEdit, onDelete, onClose,}: EditEventListModalProps) {

    // Do not render modal if not open
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="
            w-[400px] max-h-[90vh] overflow-y-auto p-8 rounded-2xl shadow-2xl border
            bg-gray-50 text-gray-900 border-gray-300
            dark:bg-[#233858] dark:text-gray-100 dark:border-[#263754]
            transition">
                {/* Modal header with title and close button */}
                <div className="mb-4 text-xl font-bold flex justify-between items-center">
                    <span>Termin bearbeiten</span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black dark:hover:text-white text-2xl transition">
                        &times;
                    </button>
                </div>

                {/* Show message if no events found */}
                {events.length === 0 ? (
                    <div className="text-gray-400 dark:text-gray-300">Keine Termine gefunden.</div>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {/* List all events */}
                        {events.map((evt) => (
                            <li
                                key={evt.id}
                                className="
                                flex flex-col rounded-lg p-3 shadow-md
                                bg-gray-100 text-gray-900
                                dark:bg-[#2e436e] dark:text-white
                                transition">

                                {/* Event title and start time */}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">{evt.title}</span>
                                    <span
                                        className="text-sm text-gray-500 dark:text-gray-300">{evt.start?.slice(0, 16)}</span>
                                </div>

                                {/* Edit and delete buttons */}
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => onEdit(evt)}
                                        className="px-3 py-1 bg-gradient-to-r from-[#a259df] to-[#38b6ff] text-white rounded-xl shadow hover:scale-105 hover:opacity-90 transition">
                                        bearbeiten
                                    </button>

                                    <button
                                        onClick={() => onDelete(evt)}
                                        className="px-3 py-1 bg-red-500 text-white rounded-xl shadow hover:bg-red-700 transition">
                                        löschen
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}