# NexaHub — Smart Campus Operations Hub

A full-stack web application that centralises campus facility management into a single platform — built as part of the **IT3030 Programming Applications & Frameworks** module at **SLIIT**.

---

## 🌐 Overview

NexaHub streamlines campus operations by bringing resource booking, maintenance ticketing, and admin oversight into one unified system. Students can book facilities and report issues, while admins and technicians manage approvals, assignments, and resolutions in real time.

---

## ✨ Features

### 🔐 Authentication & Access Control
- Google OAuth2 login with account picker enforcement
- Traditional email/password login with BCrypt hashing
- Role-based access control — Admin, Manager, Technician, Student/User

### 🏛️ Resource Management
- Admins manage lecture halls, labs, meeting rooms, equipment and common rooms
- Availability hours, capacity limits, and status tracking per resource
- Students browse and filter resources by type, location, and capacity

### 📅 Booking Workflow
- Students submit booking requests with conflict detection
- Admin approval workflow — approve, reject, or cancel with reason
- Automated notifications at every stage of the booking lifecycle

### 🔧 Maintenance Ticketing
- Students report issues with title, category, priority, description and photo evidence
- Admins assign tickets to technicians
- Technicians progress tickets: Open → In Progress → Resolved
- Notifications sent to students and admin at each status change

### 🔔 Notification System
- Real-time in-app notifications for bookings and tickets
- Unread badge count in the sidebar
- Dedicated notifications inbox with mark-as-read and delete
- Admin receives notifications for new bookings and ticket updates

### 📊 Admin Analytics Dashboard
- Live breakdown of bookings by status (Pending, Approved, Rejected, Cancelled)
- Ticket overview by status (Open, In Progress, Resolved, Closed)
- Resource overview showing active facilities, labs, and lecture halls
- Recent activity feed for bookings and tickets

### 👥 User Management
- Admin can create, edit, and delete user accounts
- Role assignment (Admin, Manager, Technician, Student/User)
- Protected admin accounts cannot be edited or deleted
- Google OAuth users automatically provisioned on first login

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React (Vite) + Tailwind CSS         |
| Backend    | Spring Boot 3.3.5 + Spring Security |
| Database   | PostgreSQL                          |
| Auth       | Google OAuth2 + BCrypt              |
| API        | RESTful APIs                        |
| Build tool | Maven                               |
