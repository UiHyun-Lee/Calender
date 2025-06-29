import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

// API handler for /api/patients
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Only allow GET requests
    if (req.method === "GET") {
        // Fetch patients from the database, ordered by lastname
        const { data, error } = await supabase
            .from("patients")
            .select("id, firstname, lastname")
            .order("lastname", { ascending: true });
        // Handle database errors
        if (error) return res.status(500).json({ error: error.message });
        // Return the list of patients
        return res.status(200).json(data);
    }
    // Method not allowed for other HTTP methods
    return res.status(405).end();
}