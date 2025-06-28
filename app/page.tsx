import { supabase } from '../lib/supabaseClient';
import CalendarWithDB from "@/components/CalendarWithDB";
import React from "react";

export default async function Home() {
    const { data, error } = await supabase.from('appointments').select('*');

    return (
        <main className="container">

            <CalendarWithDB />

        </main>
    );
}