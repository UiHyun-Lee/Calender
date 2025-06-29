import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

// API handler for /api/appointments
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle GET requests: fetch appointments, optionally filtered by category, start, end, or client
    if (req.method === "GET") {
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

        // Apply filters if provided
        if (category) query = query.eq("category", category as string);
        if (client) query = query.eq("patient", client as string);
        if (start && end) {
            query = query
                .gt("end", start as string)
                .lt("start", end as string);
        } else {
            if (start) query = query.gte("start", start as string);
            if (end) query = query.lte("end", end as string);
        }

        // Execute the query
        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // Handle POST requests: create a new appointment (create patient if needed)
    if (req.method === "POST") {
        const { title, start, end, firstname, lastname, category, notes } = req.body;

        // Check if patient already exists
        const { data: existing, error: getErr } = await supabase
            .from("patients")
            .select("id")
            .eq("firstname", firstname)
            .eq("lastname", lastname)
            .maybeSingle();
        if (getErr) return res.status(500).json({ error: getErr.message });

        let patientId = existing?.id;
        // If patient does not exist, create a new one
        if (!patientId) {
            const { data: created, error: createErr } = await supabase
                .from("patients")
                .insert([{ firstname, lastname }])
                .select("id")
                .single();
            if (createErr) return res.status(500).json({ error: createErr.message });
            patientId = created.id;
        }

        // Save the appointment with patient and category
        const { data, error } = await supabase
            .from("appointments")
            .insert([{ title, start, end, notes, patient: patientId, category }])
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    // Method not allowed for other HTTP methods
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}