import { supabase } from '../lib/supabaseClient';

export default async function Home() {
    const { data, error } = await supabase.from('appointments').select('*');

    return (
        <main>
            <h1>Termine</h1>
            {error && <div>에러: {error.message}</div>}
            <ul>
                {data?.map((a: any) => (
                    <li key={a.id}>
                        <b>{a.title}</b> - {a.start} ~ {a.end}
                        <div>Notiz: {a.notes}</div>
                    </li>
                ))}
            </ul>
        </main>
    );
}