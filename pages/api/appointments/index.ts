import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

// API-Handler für /api/appointments


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        // ✅ client 파라미터 추가
        const { category, start, end, client } = req.query;
        let query = supabase
            .from("appointments")
            .select(`
                id,
                title,
                start,
                end,
                notes,
                category,
                patient (
                    id,
                    firstname,
                    lastname
                )
            `)
            .order("start", { ascending: true });

        // ✅ category, 기간 필터 (기존과 동일)
        if (category) query = query.eq("category", category as string);

        if (start) query = query.gte("start", start as string);
        if (end) query = query.lte("end", end as string);

        // ✅ 환자 필터 추가 (id 기준!)
        if (client) query = query.eq("patient", client as string);

        // DB 쿼리 실행
        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }
    // POST: Neuen Termin anlegen (Patient ggf. neu anlegen)
    if (req.method === "POST") {
        const { title, start, end, firstname, lastname, category, notes } = req.body;

        // Prüfen, ob Patient bereits existiert
        const { data: existing, error: getErr } = await supabase
            .from("patients")
            .select("id")
            .eq("firstname", firstname)
            .eq("lastname", lastname)
            .maybeSingle();
        if (getErr) return res.status(500).json({ error: getErr.message });

        let patientId = existing?.id;
        // Falls Patient nicht existiert, neu anlegen
        if (!patientId) {
            const { data: created, error: createErr } = await supabase
                .from("patients")
                .insert([{ firstname, lastname }])
                .select("id")
                .single();
            if (createErr) return res.status(500).json({ error: createErr.message });
            patientId = created.id;
        }

        // Termin mit Patient und Kategorie speichern
        const { data, error } = await supabase
            .from("appointments")
            .insert([{ title, start, end, notes, patient: patientId, category }])
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    // Andere Methoden nicht erlaubt
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}