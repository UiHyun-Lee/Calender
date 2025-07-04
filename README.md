# Vocare Fullstack Challenge – Calendar App (Next.js, Supabase, FullCalendar)

This project is a modern calendar & appointment management web app built for the **Vocare Fullstack Tech Challenge**.

- **Book, edit, and delete appointments**
- **Filter by category, period, or client**
- **Google Calendar integration for German public holidays (red-highlighted)**
- **Dark/Light mode switch**
- **Live dashboard with instant counts for appointments and notes**
- **Responsive UI with TailwindCSS**
- **Deployed & ready for Vercel**

<br/>

##  Features

- **FullCalendar Integration:**  
  View appointments in month, week, day, and list views

- **Google Calendar (DE Holidays):**  
  See official German holidays in your calendar (highlighted in red)

- **Smart Filtering:**  
  Filter by category, date range (today/week/month), and client

- **Patient Management:**  
  Patients auto-created on appointment add

- **Notes Support:**  
  Add and view notes per appointment

- **Theme Switcher:**  
  Toggle between light and dark mode

- **Instant Edit/Delete:**  
  Edit or delete events with instant feedback

- **Localization:**  
  German interface 

- **Dashboard Sidebar:**  
  Always see current number of active appointments and notes (live updates)

<br/>

## 🛠️ Tech Stack

- **Frontend:**  
  Next.js, React, TailwindCSS, FullCalendar

- **Backend/API:**  
  Next.js API routes, Supabase (Postgres)

- **Calendar API:**  
  Google Calendar Holidays API

- **UI/UX:**  
  tippy.js (tooltips), sonner (toasts)

<br/>

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/UiHyun-Lee/Calender.git
cd calender
npm install
```

### 2. Create .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
```

### 3. Run locally

```bash
npm run dev
```
Visit http://localhost:3000


##  Demo
https://calender-phi-one.vercel.app/

## Screenshots

**Dark Mode**

<img width="1791" alt="Bildschirmfoto 2025-06-29 um 02 48 59" src="https://github.com/user-attachments/assets/ed058845-240c-4c33-9d43-3baac0906a61" />


**Light Mode**

<img width="1792" alt="Bildschirmfoto 2025-06-29 um 02 49 08" src="https://github.com/user-attachments/assets/a2985a3e-0432-4c77-9139-42856d0bd43e" />


## Challenge Requirements

- [x] **Month, week, day, and list calendar views**
- [x] **CRUD appointments**
- [x] **Filter/sort by category, period, and client**
- [x] **Tooltip details on hover**
- [x] **No changes to the database schema or foreign keys**
- [x] **Uses FullCalendar + Supabase**
- [x] **Dark/Light mode**
- [x] **Vercel ready**
