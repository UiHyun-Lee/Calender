// Appointment 타입 정의
export interface Appointment {
    id: string;
    title: string;
    start: string;    // ISO 문자열
    end?: string;     // ISO 문자열 (선택)
    category?: string;
    notes?: string;
    [key: string]: any;
}
