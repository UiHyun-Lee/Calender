import React from 'react';
import CalendarWithDB from '../components/CalendarWithDB';
import {Toaster} from "sonner";
import '../styles/globals.css';


export default function RootLayout({children}: { children: React.ReactNode }) {

    return (
        <html lang="de">
        <body className="dark">

        <Toaster position="top-center" theme="dark" richColors/>
        <div className="container mx-auto p-4">
            {children}
        </div>

        </body>
        </html>
    );
}
