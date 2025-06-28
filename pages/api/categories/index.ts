import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

// API-Handler für /api/categories
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Nur GET-Anfragen sind erlaubt
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Kategorien aus der Datenbank abfragen, nach Label sortiert
    const { data, error } = await supabase
        .from("categories")
        .select("id, label, color")
        .order("label", { ascending: true });

    // Fehlerbehandlung
    if (error) return res.status(500).json({ error: error.message });

    // Erfolgreiche Antwort mit den Kategorien
    return res.status(200).json(data);
}