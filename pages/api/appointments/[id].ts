import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

// API-Handler für /api/appointments/[id]
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };

    // GET: Einzelnen Termin mit Patientendaten abrufen
    if (req.method === "GET") {
        const { data, error } = await supabase
            .from("appointments")
            .select("*, patient(firstname,lastname)")
            .eq("id", id)
            .single();
        if (error) return res.status(404).json({ error: error.message });
        return res.status(200).json(data);
    }

    // PUT: Termin aktualisieren
    if (req.method === "PUT") {
        const updates = req.body;
        const { data, error } = await supabase
            .from("appointments")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // DELETE: Termin löschen
    // if (req.method === "DELETE") {
    //     // 1. 해당 appointment를 참조하는 activity가 있는지 확인
    //     const { count, error: checkError } = await supabase
    //         .from("activities")
    //         .select("*", { count: "exact", head: true })
    //         .eq("appointment", id);
    //
    //     if (checkError) return res.status(500).json({ error: checkError.message });
    //     if ((count ?? 0) > 0) {
    //         // 연관된 activity가 있음!
    //         return res.status(400).json({ error: "Termin kann nicht gelöscht werden, weil Aktivitäten existieren." });
    //     }
    //
    //     // 2. 아무 활동도 없으면 정상적으로 삭제
    //     const { error } = await supabase
    //         .from("appointments")
    //         .delete()
    //         .eq("id", id);
    //     if (error) return res.status(500).json({ error: error.message });
    //     return res.status(204).end();
    // }

    if (req.method === "DELETE") {
        // 1. 먼저 해당 appointment에 연결된 모든 activities 삭제
        const { error: activityDeleteError } = await supabase
            .from("activities")
            .delete()
            .eq("appointment", id);

        if (activityDeleteError) {
            return res.status(500).json({ error: "Aktivitäten konnten nicht gelöscht werden: " + activityDeleteError.message });
        }

        const { error: categoriesDeleteError } = await supabase
            .from("categories")
            .delete()
            .eq("id", id);

        if (categoriesDeleteError) {
            return res.status(500).json({ error: "Kategorien konnten nicht gelöscht werden: " + categoriesDeleteError.message });
        }

        const { error: patientsDeleteError } = await supabase
            .from("patients")
            .delete()
            .eq("id", id);

        if (patientsDeleteError) {
            return res.status(500).json({ error: "Patienten konnten nicht gelöscht werden: " + patientsDeleteError.message });
        }

        const { error: appointmentAssigneeDeleteError } = await supabase
            .from("appointment_assignee")
            .delete()
            .eq("appointment", id);

        if (appointmentAssigneeDeleteError) {
            return res.status(500).json({ error: "Aktivitäten konnten nicht gelöscht werden: " + appointmentAssigneeDeleteError.message });
        }

        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("id", id);

        if (error) {
            return res.status(500).json({ error: "Termin konnte nicht gelöscht werden: " + error.message });
        }
        return res.status(204).end();
    }

    // Andere Methoden nicht erlaubt
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}