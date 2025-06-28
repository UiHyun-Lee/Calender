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
import { toast } from "sonner";

const EventModal = dynamic(() => import("./EventModal"), { ssr: false });

const getISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function CalendarWithDB() {
    const calendarRef = useRef<FullCalendarClass | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filter, setFilter] = useState<Filter>({ categories: [] });
    const [modalOpen, setModalOpen] = useState(false);
    const [editListOpen, setEditListOpen] = useState(false);
    const [eventList, setEventList] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    // 날짜 변수들을 state로!
    const [weekStartISO, setWeekStartISO] = useState("");
    const [weekEndISO, setWeekEndISO] = useState("");
    const [monthStartISO, setMonthStartISO] = useState("");
    const [monthEndISO, setMonthEndISO] = useState("");

    // 날짜 변수들은 클라이언트에서만 계산
    useEffect(() => {
        const now = new Date();

        // 주 시작 (월요일)
        const d = new Date(now);
        const day = d.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + mondayOffset);
        const weekStart = getISODate(d);

        // 주 끝 (금요일)
        const dEnd = new Date(d);
        dEnd.setDate(d.getDate() + 4);
        const weekEnd = getISODate(dEnd);

        // 월 시작
        const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const mStartStr = getISODate(mStart);

        // 월 끝
        const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const mEndStr = getISODate(mEnd);

        setWeekStartISO(weekStart);
        setWeekEndISO(weekEnd);
        setMonthStartISO(mStartStr);
        setMonthEndISO(mEndStr);
    }, []);

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

    useEffect(() => {
        if (editListOpen) fetchEvents();
    }, [editListOpen]);

    // 수정/삭제 핸들러
    const handleEditClick = (evt: any) => {
        setSelectedEvent(evt);
        setEditModalOpen(true);
    };

    const handleDeleteClick = async (evt: any) => {
        if (!confirm("Möchten Sie das wirklich löschen?")) return;
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
    const handleFilterChangeAction = useCallback(
        (f: Filter) => {
            setFilter(f);
            const api = calendarRef.current?.getApi();
            if (!weekStartISO || !weekEndISO || !monthStartISO || !monthEndISO) return;

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
        },
        [weekStartISO, weekEndISO, monthStartISO, monthEndISO]
    );

    // 날짜 정보가 아직 준비 안 됐으면 렌더X (SSR mismatch 방지)
    if (!weekStartISO || !weekEndISO || !monthStartISO || !monthEndISO) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[var(--bg-main)] to-[#233858] pb-8">
            {/* 상단 버튼 */}
            <div className="flex justify-end items-center gap-4 px-8 py-6">
                <FilterDropdown
                    categories={categories}
                    filter={filter}
                    onFilterChange={handleFilterChangeAction}
                />
                <button
                    onClick={() => setModalOpen(true)}
                    className="btn-main"
                >
                    + Neuer Termin
                </button>
                <button
                    onClick={() => setEditListOpen(true)}
                    className="btn-main btn-danger"
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
            <div className="card mx-4 md:mx-20 my-6 overflow-hidden">
                <FullCalendar
                    ref={calendarRef}
                    themeSystem="Litera"
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
