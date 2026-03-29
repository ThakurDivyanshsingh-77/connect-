# AlumniConnect - MERN Full-Stack Networking Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

AlumniConnect is a robust, dynamic, and fully responsive MERN-stack platform built specifically to bridge the gap between current students, alumni, faculty members, and admins. The application serves as an interactive community for networking, career growth, event management, real-time communication, and mentorship tracking.

## 📖 Table of Contents

1. [Project Overview](#project-overview)
2. [Role-Wise Accessibility](#role-wise-accessibility)
3. [Deep-Dive: Core Features](#deep-dive-core-features)
4. [Tech Stack & Architecture](#tech-stack--architecture)
5. [Database Models](#database-models)
6. [API Route Structure](#api-route-structure)
7. [Environment Variables](#environment-variables)
8. [Installation & Setup](#installation--setup)
9. [Project Structure](#project-structure)
10. [Future Scope](#future-scope)

## 📌 Project Overview

This platform empowers colleges and institutional communities with a secure, verification-gated environment. The users are grouped into:
- **Juniors (Students):** Current undergraduates seeking guidance, internships, and networking.
- **Seniors (Alumni):** Graduated individuals ready to offer jobs, mentor students, and stay connected.
- **Teachers (Faculty):** Institutional educators conducting events and seminars, and guiding the community.
- **Admin:** Site moderators ensuring data integrity, managing users, roles, and content.

## 🔐 Role-Wise Accessibility & Verification

Security and authenticity are central to AlumniConnect.

| Role | Signup Availability | Verification Requirement | Capabilities & Access Limits |
| --- | --- | --- | --- |
| `junior` | Public Signup | **Strict ID Check:** College ID is mandatory. Needs Admin Approval. | Build a comprehensive profile, connect with alumni/teachers, chat directly, apply to open jobs, upload certificates, attend events. |
| `senior` | Public Signup | **Implicit Trust:** Pre-verified (or instant access workflow). | Post job opportunities, screen junior applications, act as a mentor, host events, browse all profiles. |
| `teacher`| Public Signup | **Strict ID Check:** Faculty ID is mandatory. Needs Admin Approval. | Organize professional events, view event attendees, mentor users via chat. *Note: Blocked from applying to jobs.* |
| `admin` | Internal Creation | N/A | Total platform moderation. Approve/reject verifications, manage roles, delete bad actors, supervise jobs, certificates, and events. Access analytics. |

## 🚀 Deep-Dive: Core Features

### 1. Robust Authentication & Security
- **JWT & bcrypt:** Encrypted passwords and stateless token-based sessions.
- **Verification Loop:** Registrations requiring ID proof sit in a "pending queue" until an administrator manually evaluates the uploaded proof.

### 2. Multi-Dashboard Engine
Distinct interactive UI interfaces per role:
- **Junior Board:** Heavy focus on profile progress, gamification stats, and actionable shortcuts (jobs, network).
- **Senior Board:** Management of actively posted jobs, mentorship requests, and community pulse.
- **Teacher Board:** Central hub for event management, RSVP tracking, and student interactions.
- **Admin Board:** Rich Recharts-powered analytics charting user growth, moderation lists, and system health.

### 3. Comprehensive Profiles & Digital Portfolios
- Users can update their headline, detailed bio, employment history, dynamic location, and academic batch.
- **Cloudinary Avatar Uploads:** High-performance image serving.
- **Skills Marketplace:** Users list dynamic technical/soft skills.
- **Certificate Verification System:** Users establish credibility by uploading valid academic/technical certificates.

### 4. Interactive Networking & Mentorship
- Advanced user-search algorithms filtering by Role, Name, Company, or Skill subsets.
- LinkedIn-style connection mechanisms (Send, Accept, Reject).
- **Mentorship Progress:** Deep tracking of structured mentorship relationships (`MentorshipSession`, `MentorshipProgress`, `MentorshipNote`).

### 5. Real-Time Communication Engine (Socket.IO)
- **Instant Messaging:** Low-latency robust 1-to-1 WebSockets chat.
- **Room/Group Chats:** Organized group discussions (`Room.js`).
- **Rich Media Sharing:** Messages support file uploads mapped through Cloudinary integrations.

### 6. Job & Opportunity Board
- Internal recruitment platform restricted for verified members.
- Employers create exhaustive job postings (Salary parameters, roles, requirements).
- Candidates attach custom cover letters per application.
- One-click withdrawal of applications and complete job lifecycle mapping.

### 7. Event Management Ecosystem
- End-to-end creation of workshops, webinars, and meetups with capacity restrictions and cover imagery.
- 1-click RSVP functionality. Host-side tabular attendee tracking.

### 8. Notifications Hub
- System-generated application alerts (`Notification.js`). Real-time broadcast for critical activities (Profile approvals, new messages, mentorship requests).

### 9. Gamification & Leaderboards
Drive engagement via activity-reward points:
- Job Listing Creation (`+100` pts)
- Event Registration (`+50` pts)
- Certificate Upload (`+30` pts)
- Applying to a Job (`+20` pts)
- New Connection (`+10` pts)
*Separated into Junior & Senior regional leaderboards.*

## 🛠 Tech Stack & Architecture

### **Frontend Assembly**
- **Library/Framework:** React.js 18 + Vite (for ultra-fast HMR and bundling).
- **Styling UI:** Tailwind CSS + `shadcn/ui` for modular, accessible, design-system-driven components.
- **Animations:** Framer Motion for highly fluid route transitions and interactive micro-animations.
- **Data Fetching & State:** React Query (TanStack V5), Axios.
- **Routing:** React Router DOM v6.

### **Backend Machinery**
- **Server:** Node.js powered by Express.js 5.x.
- **Database:** MongoDB queried via Mongoose ORM.
- **Realtime:** Socket.IO v4 for sub-millisecond bidirectional event signaling.
- **Storage Strategy:** Multer feeding into `multer-storage-cloudinary` for durable media hosting.

## 🗄 Database Models (Schema References)
The Node/MongoDB backend revolves around heavily interrelated schemas:
- `User`: Base authenticable entity containing role definitions.
- `Connection`: Tracks handshake states (`pending`, `accepted`, `rejected`).
- `Job`: Opportunity instances linking to applicant Arrays.
- `Event`: Tracks metadata, quotas, and participant Refs.
- `Message` & `Room`: Powers individual and broadcast payloads.
- `Mentorship` suite: `Mentorship.js`, `MentorshipSession.js`, `MentorshipNote.js` governing coach-trainee workflows.
- `Notification`: Alert delivery mechanisms.
- `Certificate`: Proof documents mapped back to User ownership.

## 📡 API Route Structure

| Scope | Base Path | Key Capabilities |
| --- | --- | --- |
| **Auth** | `/api/auth` | Login, Role-bound Signup, Persistent `/me` retrieval. |
| **User Scope** | `/api/users` | Profile updates, Leaderboard fetches, Password rotation, Settings sync. |
| **Network** | `/api/connections` | Peer-to-peer connection lifecycle mutations. |
| **Career** | `/api/jobs` | Job CRUD, Application logging, Application review APIs. |
| **Events** | `/api/events` | Event CRUD, registration logic, attendee aggregation. |
| **Realtime** | `/api/messages`, `/api/rooms` | Historical chat hydration, group-room provisioning, file upload proxies. |
| **Mentorship** | `/api/mentorships` | Dedicated pipelines for mentorship requests, session notes, and timeline progression. |
| **Notifications** | `/api/notifications` | Sync, mark-as-read, fetch notifications. |
| **Admin View**| `/api/admin`| Privilege escalation tools, system-wide content deletion, chart data compilation. |

## 🔑 Environment Variables

For the application to function locally or in production, define the following variables.

### Backend (`server/.env`)
```env
# Server Deployment Configuration
PORT=5000
FRONTEND_URL=http://localhost:8080

# Database Binding
MONGO_URI=mongodb://127.0.0.1:27017/alumni_connect

# Security Key
JWT_SECRET=YOUR_SUPER_SECURE_JWT_SECRET

# Cloudinary Setup for Media
CLOUDINARY_CLOUD_NAME=your_cloud_id
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env`)
```env
# Root path addressing the active Express API
VITE_API_URL=http://localhost:5000
```

## 💻 Installation & Setup

1. **Clone the Repository**
```bash
git clone <repository_url>
cd "alumni-connect mern stack"
```

2. **Bootstrapping the Backend**
Install the backend dependencies, ensuring MongoDB is up on your host:
```bash
cd server
npm install
# Boot via Nodemon for hot-reloading (Script in package.json)
npm run dev 
# Alternatively: npm start / node index.js
```

3. **Bootstrapping the Frontend**
```bash
cd ../frontend
npm install
npm run dev
```
The client natively runs on `http://localhost:8080`. API calls will traverse to `http://localhost:5000` assuming standard bindings.

## 📂 Project Structure
```text
alumni-connect/
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable Shadcn UI & specific layout modules
│   │   ├── hooks/        # React Query hooks bridging network APIs
│   │   ├── pages/        # Route boundaries (Dashboards, Auth, Profiles)
│   │   ├── utils/        # Utility helpers, socket instances
│   ├── package.json      # React dependencies
│   ├── vite.config.ts    # Build/Dev server specifications 
│   └── vercel.json       # Production deployment routing map
│
└── server/
    ├── controllers/      # Route-handling logic functions
    ├── middleware/       # JWT validators, Admin guards, Multer traps
    ├── models/           # Mongoose schemas (Jobs, Events, Mentorships, Users)
    ├── routes/           # Express router files
    ├── index.js          # Core Express initialization and Socket.io mounting
    └── package.json      # Node dependencies
```

## 🔭 Future Scope & Roadmap

- **Push Notifications:** PWA-based OS push messaging for crucial activity.
- **Account Data Deletion Lifecycle:** Right-to-be-forgotten exhaustive deletion routine.
- **Automated AI Moderation:** AI parsing on job descriptions to flag spam before it hits the live board.
- **Unit and E2E Tests:** Introduction of Jest & Cypress integration.

---

> **Note on Legacy Code:** `frontend/src/integrations/supabase` holds deprecated Supabase artifacts. The contemporary stack solely leverages the custom Express MongoDB cluster. Ensure you target `VITE_API_URL` rather than stale Supabase env variables.
