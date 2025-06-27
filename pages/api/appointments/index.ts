// // pages/api/appointments/index.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { supabase } from "@/lib/supabaseClient";
//
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     // ── GET: 전체/카테고리별 조회
//     if (req.method === "GET") {
//         const { category, start, end } = req.query;
//         let query = supabase
//             .from("appointments")
//             .select("id, title, start, end, category")
//             .order("start", { ascending: true });
//
//         if (category) query = query.eq("category", category as string);
//         if (start)    query = query.gte("start", start as string);
//         if (end)      query = query.lte("end", end as string);
//
//         const { data, error } = await query;
//         if (error) return res.status(500).json({ error: error.message });
//         return res.status(200).json(data);
//     }
//
//     // ── POST: 일정 생성 + patient(환자) 생성/조회 + category FK
//     if (req.method === "POST") {
//         const { title, start, end, firstname, lastname, category } = req.body;
//
//         // 1) 환자 조회 or 생성
//         const { data: existing, error: getErr } = await supabase
//             .from("patients")
//             .select("id")
//             .eq("firstname", firstname)
//             .eq("lastname", lastname)
//             .maybeSingle();
//         if (getErr) return res.status(500).json({ error: getErr.message });
//
//         let patientId = existing?.id;
//         if (!patientId) {
//             const { data: created, error: createErr } = await supabase
//                 .from("patients")
//                 .insert([{ firstname, lastname }])
//                 .select("id")
//                 .single();
//             if (createErr) return res.status(500).json({ error: createErr.message });
//             patientId = created.id;
//         }
//
//         // 2) appointments 테이블에 삽입 (category는 외래키) :contentReference[oaicite:1]{index=1}
//         const { data, error } = await supabase
//             .from("appointments")
//             .insert([{ title, start, end, patient: patientId, category }])
//             .select()
//             .single();
//
//         if (error) return res.status(500).json({ error: error.message });
//         return res.status(201).json(data);
//     }
//
//     // 지원하지 않는 메서드
//     res.setHeader("Allow", ["GET", "POST"]);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
// }


// pages/api/appointments/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // ── GET: 전체/카테고리별 조회
    if (req.method === "GET") {
        const { category, start, end } = req.query;
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
          firstname,
          lastname
        )
      `)
            .order("start", { ascending: true });

        if (category) query = query.eq("category", category as string);
        if (start)    query = query.gte("start", start as string);
        if (end)      query = query.lte("end", end as string);

        const { data, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
    }

    // ── POST: 일정 생성 (notes 포함) + patient 생성/조회 + category FK
    if (req.method === "POST") {
        const { title, start, end, firstname, lastname, category, notes } = req.body;

        // 1) 환자 조회 or 생성
        const { data: existing, error: getErr } = await supabase
            .from("patients")
            .select("id")
            .eq("firstname", firstname)
            .eq("lastname", lastname)
            .maybeSingle();
        if (getErr) return res.status(500).json({ error: getErr.message });

        let patientId = existing?.id;
        if (!patientId) {
            const { data: created, error: createErr } = await supabase
                .from("patients")
                .insert([{ firstname, lastname }])
                .select("id")
                .single();
            if (createErr) return res.status(500).json({ error: createErr.message });
            patientId = created.id;
        }

        // 2) appointments 테이블에 삽입 (notes 포함)
        const { data, error } = await supabase
            .from("appointments")
            .insert([{ title, start, end, notes, patient: patientId, category }])
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
    }

    // 지원하지 않는 메서드
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
