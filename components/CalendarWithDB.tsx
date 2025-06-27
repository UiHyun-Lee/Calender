"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import type FullCalendarClass from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabaseClient";
import FilterDropdown from "./FilterDropdown";
import type { Filter, Category } from "./FilterButtons";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import EditEventModal from "./EditEventModal";
import EditEventListModal from "./EditEventListModal";
import { toast } from "sonner"; // 알림

const EventModal = dynamic(() => import("./EventModal"), { ssr: false });

// 날짜 계산 유틸
const getISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = new Date();
const todayISO = getISODate(today);
const weekStartISO = (() => { const d = new Date(); const day = d.getDay(); const mondayOffset = day === 0 ? -6 : 1 - day; d.setDate(d.getDate() + mondayOffset); return getISODate(d); })();
const weekEndISO = (() => { const [y, m, dd] = weekStartISO.split("-").map(Number); const d = new Date(y, m - 1, dd); d.setDate(d.getDate() + 4); return getISODate(d); })();
const monthStartISO = (() => { const d = new Date(); d.setDate(1); return getISODate(d); })();
const monthEndISO = (() => { const d = new Date(); const nm = new Date(d.getFullYear(), d.getMonth() + 1, 1); nm.setDate(nm.getDate() - 1); return getISODate(nm); })();

export default function CalendarWithDB() {
    const calendarRef = useRef<FullCalendarClass | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filter, setFilter] = useState<Filter>({ categories: [] });
    const [modalOpen, setModalOpen] = useState(false);
    const [editListOpen, setEditListOpen] = useState(false);
    const [eventList, setEventList] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        supabase
            .from("categories")
            .select("id, label, color")
            .order("label", { ascending: true })
            .then(({ data, error }) => {
                if (error) console.error(error);
                else if (data) setCategories(data);
            });
    }, []);

    // 이벤트 목록 가져오기
    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .order("start", { ascending: true });
        if (!error) setEventList(data || []);
    };

    useEffect(() => { if (editListOpen) fetchEvents(); }, [editListOpen]);

    // 수정/삭제 핸들러
    const handleEditClick = (evt: any) => {
        setSelectedEvent(evt);
        setEditModalOpen(true);
    };

    const handleDeleteClick = async (evt: any) => {
        if (!confirm("정말로 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`/api/appointments/${evt.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setEventList(eventList.filter(e => e.id !== evt.id));
            calendarRef.current?.getApi().refetchEvents();
            toast.success("Termin wurde gelöscht!");
        } catch {
            toast.error("Löschen fehlgeschlagen!");
        }
    };

    const handleUpdateEvent = async (data: any) => {
        try {
            if (!selectedEvent) return;
            const res = await fetch(`/api/appointments/${selectedEvent.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error();
            setEditModalOpen(false);
            setEditListOpen(true);
            fetchEvents();
            calendarRef.current?.getApi().refetchEvents();
            toast.success("Termin wurde geändert!");
        } catch {
            toast.error("Ändern fehlgeschlagen!");
        }
    };

    // 필터 변경
    const handleFilterChangeAction = useCallback((f: Filter) => {
        setFilter(f);
        const api = calendarRef.current?.getApi();
        if (f.start && f.end) {
            if (f.start === f.end) {
                api?.changeView("timeGridDay", f.start);
            } else if (f.start === weekStartISO && f.end === weekEndISO) {
                api?.changeView("timeGridWeek", f.start);
            } else if (f.start === monthStartISO && f.end === monthEndISO) {
                api?.changeView("dayGridMonth", f.start);
            } else {
                api?.changeView("dayGridMonth");
            }
        } else {
            api?.changeView("dayGridMonth");
        }
        api?.refetchEvents();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#162841] to-[#233858] pb-8">
            {/* 상단 버튼 */}
            <div className="flex justify-end items-center gap-4 px-8 py-6">
                <FilterDropdown
                    categories={categories}
                    filter={filter}
                    onFilterChange={handleFilterChangeAction}
                />
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-gradient-to-r from-[#a259df] to-[#38b6ff] px-6 py-2 rounded-full font-bold text-white shadow-xl hover:scale-105 hover:opacity-90 transition"
                >
                    + Neuer Termin
                </button>
                <button
                    onClick={() => setEditListOpen(true)}
                    className="bg-gradient-to-r from-pink-400 to-red-500 px-6 py-2 rounded-full font-bold text-white shadow-xl hover:scale-105 hover:opacity-90 transition"
                >
                    Termin bearbeiten
                </button>
            </div>

            {/* 일정 목록 관리 모달 */}
            <EditEventListModal
                open={editListOpen}
                events={eventList}
                categories={categories}
                onEdit={evt => { setEditListOpen(false); handleEditClick(evt); }}
                onDelete={handleDeleteClick}
                onClose={() => setEditListOpen(false)}
            />

            {/* 일정 수정 모달 */}
            <EditEventModal
                open={editModalOpen}
                event={selectedEvent}
                categories={categories}
                onUpdate={handleUpdateEvent}
                onDelete={async () => {
                    await handleDeleteClick(selectedEvent);
                    setEditModalOpen(false);
                }}
                onClose={() => setEditModalOpen(false)}
            />

            {/* 일정 추가 모달 */}
            <EventModal
                open={modalOpen}
                onCloseAction={() => setModalOpen(false)}
                onAddAction={async (evt) => {
                    try {
                        const res = await fetch("/api/appointments", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(evt),
                        });
                        if (!res.ok) throw new Error();
                        calendarRef.current?.getApi().refetchEvents();
                        setModalOpen(false);
                        toast.success("Termin wurde erstellt!");
                    } catch {
                        toast.error("Erstellen fehlgeschlagen!");
                    }
                }}
                categories={categories}
            />

            {/* FullCalendar */}
            <div className="rounded-2xl bg-[#233858] shadow-2xl mx-4 md:mx-20 my-6 border border-[#263754] overflow-hidden">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                    initialView="dayGridMonth"
                    dayMaxEvents={2}
                    moreLinkClick="popover"
                    views={{
                        dayGridMonth: { dayMaxEvents: 3 },
                        dayGridWeek: { dayMaxEvents: 2 },
                    }}
                    locale="de"
                    height="80vh"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                    }}
                    eventSources={[
                        {
                            url: "/api/appointments",
                            method: "GET",
                            extraParams: {
                                ...(filter.categories.length > 0 && !filter.categories.includes("all")
                                    ? { category: filter.categories }
                                    : {}),
                                ...(filter.start ? { start: filter.start } : {}),
                                ...(filter.end ? { end: filter.end } : {}),
                                ...(filter.client ? { client: filter.client } : {}),
                            },
                        },
                    ]}
                    eventMouseEnter={(info) => {
                        const { notes, patient } = info.event.extendedProps as any;
                        const firstname = patient?.firstname || "";
                        const lastname = patient?.lastname || "";
                        const fmt = (d: any) =>
                            d instanceof Date
                                ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
                                : "";
                        const startStr = fmt(info.event.start);
                        const endStr = fmt(info.event.end);
                        info.el.removeAttribute("title");
                        info.el
                            .querySelectorAll<HTMLElement>("[title]")
                            .forEach((el) => el.removeAttribute("title"));
                        if (!(info.el as any)._tippy) {
                            const instance = tippy(info.el, {
                                allowHTML: true,
                                interactive: true,
                                placement: "top",
                                delay: [100, 50],
                                content: `
                                <div style="font-size:14px;line-height:1.4">
                                  <strong>${firstname} ${lastname}</strong><br/>
                                  <em>${startStr}${endStr ? " – " + endStr : ""}</em><br/>
                                  ${notes || ""}
                                </div>
                              `,
                            });
                            instance.show();
                        } else {
                            (info.el as any)._tippy.show();
                        }
                    }}
                    eventMouseLeave={(info) => {
                        (info.el as any)._tippy.hide();
                    }}
                />
            </div>
        </div>
    );
}
