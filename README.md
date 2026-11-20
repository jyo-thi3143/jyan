# JYAN

> **Your desktop. Your rules.**

JYAN is a desktop AI assistant designed to help users interact with their computer through a simple, friendly interface.

JYAN combines an AI chat experience with desktop utilities and, eventually, system-level capabilities such as application control, file access, and security monitoring.

## ✨ Features

### 💬 AI Assistant

Chat with JYAN through a friendly desktop companion interface.

### ⏱ Timer

Set, start, pause, and reset countdown timers directly from JYAN.

### 📁 Files

Browse and interact with files through the JYAN interface.

> The current version contains a frontend prototype. Real desktop file-system access will be implemented through the backend.

### 🛡 Security

A security dashboard designed to provide visibility into desktop activity and potential security events.

> Security monitoring is currently a frontend prototype. Real application/process monitoring will be implemented through the backend.

### 🐞 Desktop Companion

A draggable JYAN mascot that acts as the entry point to the assistant.

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Python
- FastAPI

### AI

- AI API integration — coming soon

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) — required to run the React/Vite frontend
- npm — included with Node.js
- Git — required to clone the repository

### Clone the repository

```bash
git clone https://github.com/jyo-thi3143/jyan.git
cd jyan
```

### Run the frontend

Navigate to the client directory:

```bash
cd client
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display a local URL in the terminal, usually:

```text
http://localhost:5173/
```

Open that URL in your browser to launch JYAN.

> The backend is currently under development. Once the Python/FastAPI server is added, additional setup instructions will be provided here.

## 📂 Project Structure

```text
jyan/
├── README.md
├── client/
│   └── React + TypeScript frontend
└── server/
    └── Python + FastAPI backend
```

## 🚧 Current Status

JYAN is currently under active development.

### Frontend

- [ ] Desktop companion mascot
- [ ] Draggable mascot
- [ ] Chat interface
- [ ] Sidebar navigation
- [ ] Functional timer
- [ ] Files interface prototype
- [ ] Security dashboard prototype
- [ ] Responsive frontend interactions

### Backend

- [ ] FastAPI server
- [ ] AI integration
- [ ] API connection with frontend
- [ ] Desktop application control
- [ ] Real file-system interaction
- [ ] Application/process monitoring
- [ ] Security event detection

## 👥 Team

**Jyo** — Frontend
React, TypeScript, Vite, UI/UX

**Nissie** — Backend
Python, FastAPI, backend services

## 🎯 Vision

JYAN is being built as more than a chatbot.

The goal is to create a desktop AI companion that can understand user requests and safely interact with the user's computer while keeping the user in control.

> **Your desktop. Your rules.**

