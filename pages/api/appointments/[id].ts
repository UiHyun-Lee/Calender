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
    if (req.method === "DELETE") {
        // 1. 해당 appointment를 참조하는 activity가 있는지 확인
        const { count, error: checkError } = await supabase
            .from("activities")
            .select("*", { count: "exact", head: true })
            .eq("appointment", id);

        if (checkError) return res.status(500).json({ error: checkError.message });
        if ((count ?? 0) > 0) {
            // 연관된 activity가 있음!
            return res.status(400).json({ error: "Termin kann nicht gelöscht werden, weil Aktivitäten existieren." });
        }

        // 2. 아무 활동도 없으면 정상적으로 삭제
        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("id", id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(204).end();
    }

    // Andere Methoden nicht erlaubt
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}