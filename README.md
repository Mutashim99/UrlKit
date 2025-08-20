# URLKit – AI-Powered URL Shortener

URLKit is a modern, production-ready URL shortener built with a focus on **security, scalability, and reliability**.  
It provides full URL management, background job processing, and AI-based link safety checks.  

---

## Features

- **Authentication & Dashboard** – Secure login and user-specific link management.  
- **URL Management** – Create, update, delete, and customize short links.  
- **Expiry & Scheduling** – Automatic cleanup of expired links via cron jobs.  
- **Analytics** – Track click counts and monitor engagement.  
- **Background Jobs** – Email notifications and other tasks processed with BullMQ and Redis.  
- **AI-Powered Security** – Links are analyzed with Gemini API to detect phishing or spam.  

---

## Tech Stack

- **Backend**: Node.js, Express, Prisma, PostgreSQL  
- **Job Queue & Scheduling**: BullMQ, Redis, Cron Jobs  
- **Frontend**: React, TailwindCSS, Zustand  
- **AI Integration**: Google Gemini API  
- **Auth**: JWT-based authentication  

---

## Roadmap

- Advanced analytics (geo, device, browser stats)  
- Admin dashboard for abuse monitoring  
- Public API access  
- Support for branded/custom domains  

---

## License  

MIT License © 2025
