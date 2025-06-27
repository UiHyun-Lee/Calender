// app/layout.tsx
import React from 'react';
import { Inter } from 'next/font/google';
import CalendarWithDB from '../../calendar/components/CalendarWithDB';
import { Toaster } from "sonner";
import '../../vocare/styles/globals.css';


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="de">
        <body className= "dark" >

        <Toaster position="top-center" theme="dark" richColors />

        <CalendarWithDB />

        <div className="container mx-auto p-4">
            {children}
        </div>

        </body>
        </html>
    );
}
