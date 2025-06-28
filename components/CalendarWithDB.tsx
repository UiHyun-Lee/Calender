"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import type FullCalendarClass from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabaseClient";
import DashboardSidebar from "./DashboardSidebar";
import FilterDropdown from "./FilterDropdown";
import type { Filter, Category } from "./FilterButtons";
import { getWeekStartEndISO, getMonthStartEndISO } from "../lib/dateUtils";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import EditEventModal from "./EditEventModal";
import EditEventListModal from "./EditEventListModal";
import { toast } from "sonner";
import { Plus, SquarePen } from "lucide-react";
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import deLocale from '@fullcalendar/core/locales/de';
const EventModal = dynamic(() => import("./EventModal"), { ssr: false });

export default function CalendarWithDB() {
    const calendarRef = useRef<FullCalendarClass | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filter, setFilter] = useState<Filter>({ categories: [] });
    const [modalOpen, setModalOpen] = useState(false);
    const [editListOpen, setEditListOpen] = useState(false);
    const [eventList, setEventList] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [calTheme, setCalTheme] = useState<"light" | "dark">("dark");
    const [now, setNow] = useState(new Date());
    const { start: weekStartISO, end: weekEndISO } = getWeekStartEndISO();
    const { start: monthStartISO, end: monthEndISO } = getMonthStartEndISO();
    const [patients, setPatients] = useState<{ id: string; firstname: string; lastname: string }[]>([]);


    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60 * 1000);
        return () => clearInterval(timer);
    }, []);
    // 환자 목록 패칭
    useEffect(() => {
        fetch("/api/patients")
            .then(res => res.json())
            .then(data => setPatients(data));
    }, []);

    useEffect(() => {
        document.body.classList.remove("light-mode", "dark-mode");
        document.body.classList.remove("dark", "light");
        if (calTheme === "dark") {
            document.body.classList.add("dark-mode");
            document.body.classList.add("dark");
        } else {
            document.body.classList.add("light-mode");
            document.body.classList.add("light");
        }
    }, [calTheme]);

    // 카테고리 로드
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

    // ⚡ 이벤트 fetch 함수
    const fetchEvents = async () => {
        const { data, error } = await supabase
            .from("appointments")
            .select("*, patient:patient(id, firstname, lastname)")
            .order("start", { ascending: true });
        if (!error) setEventList(data || []);
    };

    // 이벤트 편집 모달 열릴 때 새로고침
    useEffect(() => {
        if (editListOpen) fetchEvents();
    }, [editListOpen]);

    const handleEditClick = (evt: any) => {
        setSelectedEvent(evt);
        setEditModalOpen(true);
    };

    const clientList = useMemo(() => {
        // 일정이 있는 환자만 추출, 중복 제거
        const seen = new Set<string>();
        return eventList
            .map(e => e.patient)
            .filter(
                (p): p is { id: string; firstname: string; lastname: string } =>
                    !!p && !seen.has(p.id) && (seen.add(p.id), true)
            );
    }, [eventList]);

    const handleDeleteClick = async (evt: any) => {
        if (!confirm("Möchten Sie das wirklich löschen?")) return;
        try {
            const res = await fetch(`/api/appointments/${evt.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            calendarRef.current?.getApi().refetchEvents();
            await fetchEvents();
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
            calendarRef.current?.getApi().refetchEvents();
            toast.success("Termin wurde geändert!");
        } catch {
            toast.error("Ändern fehlgeschlagen!");
        }
    };

    // 필터 변경시 새로고침(FullCalendar refetchEvents도 호출)
    const handleFilterChangeAction = useCallback(
        (f: Filter) => {
            setFilter(f);
            const api = calendarRef.current?.getApi();
            if (f.start && f.end) {
                if (f.start === f.end) api?.changeView("timeGridDay", f.start);
                else if (f.start === weekStartISO && f.end === weekEndISO)
                    api?.changeView("timeGridWeek", f.start);
                else if (f.start === monthStartISO && f.end === monthEndISO)
                    api?.changeView("dayGridMonth", f.start);
                else api?.changeView("dayGridMonth");
            } else {
                api?.changeView("dayGridMonth");
            }
            api?.refetchEvents();
        },
        [weekStartISO, weekEndISO, monthStartISO, monthEndISO]
    );

    // 테마 토글 함수
    const handleThemeToggle = () => {
        setCalTheme((ct) => (ct === "light" ? "dark" : "light"));
    };

    return (
        <div className="flex h-screen">
            <aside className="w-64 h-full bg-panel">
                <DashboardSidebar
                    events={eventList}
                    onToggleCalendarTheme={handleThemeToggle}
                    theme={calTheme}
                    onRefresh={fetchEvents}
                />
            </aside>

            <div className="flex-1 overflow-auto">
                <div className={`min-h-screen pb-8 ${calTheme === "dark"
                    ? "bg-[#162841] text-white"
                    : "bg-white text-black"} rounded-2xl shadow-xl`}
                >
                    <div className="flex justify-end items-center gap-4 px-8 py-6">
                        <FilterDropdown
                            categories={categories}
                            filter={filter}
                            onFilterChange={handleFilterChangeAction}
                            clientList={clientList}
                        />
                        <button className="btn-main group flex items-center justify-center relative min-w-[44px]"
                                onClick={() => setModalOpen(true)}>
                            <span className="block group-hover:hidden transition-all">
                            <Plus /></span>
                            <span className="hidden group-hover:inline transition-all whitespace-nowrap">
                             Neuer Termin
                            </span>
                        </button>
                        <button className="btn-main group flex items-center justify-center relative min-w-[44px]"
                                onClick={() => setEditListOpen(true)}>
                            <span className="block group-hover:hidden transition-all">
                            <SquarePen /></span>
                            <span className="hidden group-hover:inline transition-all whitespace-nowrap">
                             Termin bearbeiten
                            </span>
                        </button>
                    </div>

                    <EditEventListModal
                        open={editListOpen}
                        events={eventList}
                        categories={categories}
                        onEdit={(evt) => {
                            setEditListOpen(false);
                            handleEditClick(evt);
                        }}
                        onDelete={handleDeleteClick}
                        onClose={() => setEditListOpen(false)}
                    />
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
                                await fetchEvents();
                                setModalOpen(false);
                                toast.success("Termin wurde erstellt!");
                            } catch {
                                toast.error("Erstellen fehlgeschlagen!");
                            }
                        }}
                        categories={categories}
                    />

                    <div className="card mx-4 md:mx-20 my-6 overflow-hidden">
                        <FullCalendar
                            ref={calendarRef}
                            themeSystem="Litera"
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin,googleCalendarPlugin]}
                            googleCalendarApiKey={process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY}
                            initialView="dayGridMonth"
                            dayMaxEvents={2}
                            moreLinkClick="popover"
                            views={{
                                dayGridMonth: { dayMaxEvents: 3 },
                                dayGridWeek: { dayMaxEvents: 2 },
                            }}
                            locale={deLocale}
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
                                        ...(filter.client ? { client: filter.client } : {})
                                    },
                                },
                                // Google Holiday Calendar (독일)
                                {
                                    googleCalendarId: "de.german#holiday@group.v.calendar.google.com",
                                    color: "#f87171",
                                    textColor: "#fff",
                                    className: "gcal-holiday",
                                },
                            ]}
                            eventMouseEnter={(info) => {
                                const { notes, patient } = info.event.extendedProps as any;
                                const firstname = patient?.firstname || "";
                                const lastname = patient?.lastname || "";
                                const fmt = (d: any) =>
                                    d instanceof Date
                                        ? d.toLocaleTimeString("de-DE", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
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
                      </div>`
                                    });
                                    instance.show();
                                } else {
                                    (info.el as any)._tippy.show();
                                }
                            }}
                            eventMouseLeave={(info) => {
                                (info.el as any)._tippy.hide();
                            }}
                            eventChange={fetchEvents}
                            eventAdd={fetchEvents}
                            eventRemove={fetchEvents}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

