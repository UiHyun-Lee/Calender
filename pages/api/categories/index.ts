import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const { data, error } = await supabase
        .from("categories")
        .select("id, label, color")
        .order("label", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
}
