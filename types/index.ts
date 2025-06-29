export interface Appointment {
    id: string;
    title: string;
    start: string;
    end?: string;
    category?: string;
    notes?: string;
    [key: string]: any;
}
