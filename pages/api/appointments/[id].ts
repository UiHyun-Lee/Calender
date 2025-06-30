// import type { NextApiRequest, NextApiResponse } from "next";
// import { supabase } from "../../../lib/supabaseClient";
//
// // API-Handler für /api/appointments/[id]
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { id } = req.query as { id: string };
//
//     // GET: Einzelnen Termin mit Patientendaten abrufen
//     if (req.method === "GET") {
//         const { data, error } = await supabase
//             .from("appointments")
//             .select("*, patient(firstname,lastname)")
//             .eq("id", id)
//             .single();
//         if (error) return res.status(404).json({ error: error.message });
//         return res.status(200).json(data);
//     }
//
//     // PUT: Termin aktualisieren
//     if (req.method === "PUT") {
//         const updates = req.body;
//         const { data, error } = await supabase
//             .from("appointments")
//             .update(updates)
//             .eq("id", id)
//             .select()
//             .single();
//         if (error) return res.status(500).json({ error: error.message });
//
//         const { firstname, lastname } = updates;
//
//         if (firstname && lastname && data?.patient) {
//             const patientId =
//                 typeof data.patient === "object" ? data.patient.id : data.patient;
//             const { error: patientError } = await supabase
//                 .from("patients")
//                 .update({ firstname, lastname })
//                 .eq("id", patientId);
//
//             if (patientError)
//                 return res.status(500).json({ error: patientError.message });
//         }
//         return res.status(200).json(data);
//     }
//
//     // DELETE: Termin löschen
//     if (req.method === "DELETE") {
//         const { error: activityDeleteError } = await supabase
//             .from("activities")
//             .delete()
//             .eq("appointment", id);
//
//         if (activityDeleteError) {
//             return res.status(500).json({ error: "Aktivitäten konnten nicht gelöscht werden: " + activityDeleteError.message });
//         }
//
//         const { error: categoriesDeleteError } = await supabase
//             .from("categories")
//             .delete()
//             .eq("id", id);
//
//         if (categoriesDeleteError) {
//             return res.status(500).json({ error: "Kategorien konnten nicht gelöscht werden: " + categoriesDeleteError.message });
//         }
//
//         const { error: patientsDeleteError } = await supabase
//             .from("patients")
//             .delete()
//             .eq("id", id);
//
//         if (patientsDeleteError) {
//             return res.status(500).json({ error: "Patienten konnten nicht gelöscht werden: " + patientsDeleteError.message });
//         }
//
//         const { error: appointmentAssigneeDeleteError } = await supabase
//             .from("appointment_assignee")
//             .delete()
//             .eq("appointment", id);
//
//         if (appointmentAssigneeDeleteError) {
//             return res.status(500).json({ error: "Aktivitäten konnten nicht gelöscht werden: " + appointmentAssigneeDeleteError.message });
//         }
//
//         const { error } = await supabase
//             .from("appointments")
//             .delete()
//             .eq("id", id);
//
//         if (error) {
//             return res.status(500).json({ error: "Termin konnte nicht gelöscht werden: " + error.message });
//         }
//         return res.status(204).end();
//     }
//
//     // Andere Methoden nicht erlaubt
//     res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
// }

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

// API-Handler für /api/appointments/[id]
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query as { id: string };

    // GET: Einzelnen Termin mit Patientendaten abrufen
    if (req.method === "GET") {
        const { data, error } = await supabase
            .from("appointments")
            .select("*, patient(id, firstname, lastname)")
            .eq("id", id)
            .single();
        if (error) return res.status(404).json({ error: error.message });
        return res.status(200).json(data);
    }

    // PUT: Termin aktualisieren + Patientendaten mitändern
    if (req.method === "PUT") {
        const updates = req.body;

        // 1. Termin aktualisieren
        const { data, error } = await supabase
            .from("appointments")
            .update({
                title: updates.title,
                start: updates.start,
                end: updates.end,
                category: updates.category,
                notes: updates.notes,
            })
            .eq("id", id)
            .select("*, patient(id, firstname, lastname)")
            .single();

        if (error) return res.status(500).json({ error: error.message });

        // 2. Patient aktualisieren (Vorname/Nachname)
        const { firstname, lastname } = updates;
        const patientId = data?.patient?.id;
        if (firstname && lastname && patientId) {
            const { error: patientError } = await supabase
                .from("patients")
                .update({ firstname, lastname })
                .eq("id", patientId);

            if (patientError)
                return res.status(500).json({ error: patientError.message });
        }
        return res.status(200).json(data);
    }

    // DELETE: Termin löschen
    if (req.method === "DELETE") {
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
