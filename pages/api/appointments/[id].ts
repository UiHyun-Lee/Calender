// pages/api/appointments/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };

    if (req.method === "GET") {
        const { data, error } = await supabase
            .from("appointments")
            .select("*, patient(firstname,lastname)")
            .eq("id", id)
            .single();
        if (error) return res.status(404).json({ error: error.message });
        return res.status(200).json(data);
    }
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

    if (req.method === "DELETE") {
        const { error } = await supabase
            .from("appointments")
            .delete()
            .eq("id", id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
