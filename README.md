# AlumniConnect

AlumniConnect is a MERN-based alumni networking platform built to connect current students, alumni, teachers, and admins in one system. The project combines verified onboarding, profile building, networking, jobs, events, real-time messaging, certificates, leaderboard gamification, and an admin moderation panel.

## Project Summary

This platform is designed for colleges and alumni communities where:

- `junior` users represent current students
- `senior` users represent alumni or pass-out students
- `teacher` users represent faculty or mentors
- `admin` users manage the full platform

The application has:

- a React + TypeScript + Vite frontend
- an Express + MongoDB backend
- Socket.IO based chat
- multer-based file uploads for ID cards, certificates, event images, and chat attachments

## Core Features

- Role-based signup and login
- ID verification workflow for juniors and teachers
- Role-based dashboards
- Public and personal profile management
- Skills and certificate management
- Alumni network with connection requests
- Real-time one-to-one chat with file attachment support
- Job posting and job application flow
- Event creation, registration, and attendee management
- Gamification with points and leaderboard
- Admin dashboard with analytics and moderation tools
- Public marketing pages like About, Features, Contact, Privacy, Terms, and Cookie Policy

## Role-Wise Access

| Role | Who it is | Signup availability | Verification | Main capabilities |
| --- | --- | --- | --- | --- |
| `junior` | Current student | Public signup | College ID required, admin approval needed | Build profile, upload certificates, connect with people, chat, apply to jobs, register for events, earn leaderboard points |
| `senior` | Alumni / pass-out | Public signup | Instant access in current implementation | Post jobs, view applicants, connect with juniors and teachers, chat, create events, mentor others, participate in leaderboard |
| `teacher` | Faculty / mentor | Public signup | Faculty ID required, admin approval needed | Create events, view attendees for owned events, connect and chat with users, guide students, participate in leaderboard |
| `admin` | Platform manager | Not part of public signup flow | Managed manually / by invitation | Verify users, manage roles, delete users, manage jobs, manage events, manage certificates, view analytics and platform stats |

## What Each Role Does

### Junior

- Signs up as a current student.
- Must upload a college ID card.
- Stays in `pending verification` until approved by admin.
- Gets a student dashboard with progress stats and quick actions.
- Can edit profile, add skills, and upload certificates.
- Can browse the network and send or accept connection requests.
- Can message connected users.
- Can apply for jobs.
- Can register for events.
- Can earn points and appear on the junior leaderboard.

### Senior

- Signs up as alumni or pass-out.
- Gets instant verified access in the current backend logic.
- Gets an alumni dashboard.
- Can post job opportunities.
- Can view job applicants and their cover letters/messages.
- Can network with juniors, teachers, and other seniors.
- Can mentor users through direct messaging.
- Can create events in the current implementation.
- Can earn points and appear on the senior leaderboard.

### Teacher

- Signs up as faculty or mentor.
- Must upload a faculty ID card.
- Needs admin approval before full access.
- Gets a teacher dashboard.
- Can create events such as workshops, seminars, webinars, or meetups.
- Can view the attendee list for events they created.
- Can connect with students and alumni.
- Can guide users through messaging.
- Can earn leaderboard points.
- Teachers cannot apply for jobs in the current backend logic.

### Admin

- Uses protected admin-only routes.
- Gets an admin dashboard with stats and recent registrations.
- Can approve or reject pending verification requests.
- Can change user roles.
- Can delete users.
- Can manage all jobs.
- Can manage all events.
- Can manage all certificates.
- Can open analytics dashboards with charts and user counts.

## Main User Journey

1. User selects a role during signup.
2. `senior` gets immediate access, while `junior` and `teacher` go to pending verification.
3. Verified users complete profile, add skills, upload certificates, and join the network.
4. Seniors post jobs, teachers and seniors create events, users connect and message each other.
5. Activity adds leaderboard points.
6. Admin monitors and moderates the platform.

## Functional Modules

### 1. Authentication and Verification

- Signup with `name`, `email`, `password`, `role`, optional `batch`, and optional `idCard`.
- Login with JWT-based auth.
- Persistent login via `/api/auth/me`.
- Verification queue for pending ID review.
- Protected admin routes.

### 2. Dashboards

- `junior` dashboard:
  - progress section
  - stats cards
  - quick links to jobs, events, network, and leaderboard
- `senior` dashboard:
  - posted jobs overview
  - network and mentorship focus
  - quick actions for jobs and messaging
- `teacher` dashboard:
  - event creation and upcoming event view
  - student connection focus
- `admin` dashboard:
  - platform stats
  - recent users
  - direct links to moderation sections

### 3. Profiles and Skills

- Profile edit form for:
  - name
  - headline
  - bio
  - location
  - company
  - designation
  - website
  - batch
- Avatar upload
- Skills management
- Public profile page for viewing:
  - role
  - headline
  - company/designation
  - location
  - batch
  - points
  - skills
  - certificates

### 4. Certificates

- Users can upload certificate proof files.
- Certificate categories supported:
  - `academic`
  - `professional`
  - `technical`
  - `workshop`
  - `other`
- Certificates appear on the user profile.
- Users can delete their own certificates.
- Admin can view and delete any certificate.

### 5. Networking

- View verified users except admins.
- Search by name, company, or skills.
- Filter by role.
- Send connection requests.
- Accept or reject received requests.
- Open chat from connected profiles.
- Visit another user's profile directly from the network.

### 6. Messaging

- One-to-one conversations
- Conversation list with latest message preview
- Real-time updates using Socket.IO
- File upload support in chat
- Image and non-image attachment rendering

### 7. Jobs

- Job listings include:
  - title
  - company
  - location
  - type
  - description
  - salary or experience style text
- Seniors and admins can post jobs.
- Non-owners can apply to jobs.
- Teachers are blocked from job applications by backend rule.
- Applicants can send a cover letter.
- Job owner can view applicant list.
- Job owner can delete their own job.
- Admin can delete any job from admin panel.

### 8. Events

- Events support:
  - title
  - description
  - date
  - time
  - location
  - type
  - max participants
  - cover image
- Teachers, seniors, and admins can create events.
- Users can register and unregister.
- Organizers can view attendee list.
- Organizers can delete their own event.
- Admin can delete any event from admin panel.

### 9. Leaderboard and Gamification

The UI and main controllers use the following points model:

| Activity | Points |
| --- | --- |
| Event registration | `+50` |
| Certificate upload | `+30` |
| Job post | `+100` |
| Job application | `+20` |
| Accepted connection | `+10` |

Leaderboard groups users into:

- junior leaderboard
- senior leaderboard

Admins are excluded from leaderboard results.

### 10. Settings

- Email notifications toggle
- Public/private profile visibility
- Change password form

## Admin Panel Details

Admin routes available in the frontend:

- `/admin`
- `/admin/analytics`
- `/admin/users`
- `/admin/verification`
- `/admin/jobs`
- `/admin/events`
- `/admin/certificates`

Admin capabilities include:

- dashboard stats
- verification queue
- role changes
- user deletion
- jobs moderation
- events moderation
- certificate moderation
- analytics charts and recent registrations
- CSV export from user management page

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Framer Motion
- Axios
- React Router
- TanStack Query
- Socket.IO client
- Recharts

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- multer
- Socket.IO

## Project Structure

```text
alumni-connect mern stack/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- utils/
|   |-- index.html
|   |-- package.json
|   |-- vite.config.ts
|   |-- vercel.json
|
|-- server/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- index.js
|   |-- package.json
|
|-- README.md
```

## Backend API Overview

| Base route | Purpose |
| --- | --- |
| `/api/auth` | signup, login, current user |
| `/api/users` | leaderboard, profile, avatar, skills, settings, password, certificates, user stats |
| `/api/connections` | send request, list connections, accept/reject |
| `/api/jobs` | list jobs, post jobs, apply, view applicants, delete own job |
| `/api/events` | list events, create events, register, unregister, attendees, delete |
| `/api/messages` | upload file, send message, conversation list, chat history |
| `/api/admin` | stats, user management, verification, jobs, events, certificates, analytics |

## Database Models

Main MongoDB collections used in the backend:

- `User`
- `Connection`
- `Job`
- `Event`
- `Message`
- `Certificate`

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd "alumni-connect mern stack"
cd frontend && npm install
cd ../server && npm install
```

### 2. Create environment variables

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000
```

Backend `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/alumni_connect
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:8080
```

### 3. Run backend

```bash
cd server
node index.js
```

Optional during development:

```bash
npx nodemon index.js
```

### 4. Run frontend

```bash
cd frontend
npm run dev
```

The Vite config runs the frontend on port `8080`.

## Local Run Notes

- Frontend base API URL comes from [`frontend/src/utils/config.ts`](frontend/src/utils/config.ts) and now defaults to `http://localhost:5000`.
- Vite dev server runs on `http://localhost:8080`.
- Backend serves uploads from `/uploads`.
- Backend Socket.IO and CORS are configured in [`server/index.js`](server/index.js) for local frontend origins by default.

## Important Implementation Notes

- The primary active application flow is MERN-based.
- There are legacy Supabase-related files inside `frontend/src/integrations/supabase` and some old hooks, but the main live routes use the Express and MongoDB backend.
- [`frontend/src/hooks/useNetwork.tsx`](frontend/src/hooks/useNetwork.tsx) currently uses hardcoded deployed backend URLs instead of only using `VITE_API_URL`.
- [`server/index.js`](server/index.js) now defaults to local frontend origins and can still be overridden through `FRONTEND_URL` or `FRONTEND_URLS`.
- The settings page shows a `Delete My Account` button, but a matching backend delete-account route is not implemented yet.
- The backend `server/package.json` does not currently include a `dev` script, so local backend development should use `node index.js` or `npx nodemon index.js`.

## Recommended Future Improvements

- Move all hardcoded URLs and origins into environment variables.
- Add `.env.example` files for frontend and backend.
- Add backend `dev` and `start` scripts.
- Add tests for auth, jobs, events, and admin workflows.
- Add notification system for verification approval and event updates.
- Add a complete account deletion flow.

## Conclusion

AlumniConnect is a full-featured college networking platform with separate experiences for students, alumni, teachers, and admins. It is especially strong in role-based access, networking, job sharing, event management, real-time messaging, and admin moderation.
