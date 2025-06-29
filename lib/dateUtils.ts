// Returns a date in ISO format (YYYY-MM-DD)
export const getISODate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Returns today's date in ISO format
export function getTodayISO() {
    return getISODate(new Date());
}

// Returns the ISO start and end date of the current week (Monday to Friday)
export function getWeekStartEndISO(): { start: string; end: string } {
    const d = new Date();
    const day = d.getDay();
    // Calculate offset to get Monday
    const mondayOffset = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + mondayOffset);
    const start = getISODate(d);
    d.setDate(d.getDate() + 4);
    const end = getISODate(d);
    return { start, end };
}

// Returns the ISO start and end date of the current month
export function getMonthStartEndISO(): { start: string; end: string } {
    const now = new Date();
    const start = getISODate(new Date(now.getFullYear(), now.getMonth(), 1));
    const end = getISODate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return { start, end };
}