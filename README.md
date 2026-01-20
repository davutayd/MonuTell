# 🏛️ MonuTell – AI-Powered Interactive Audio Guide

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs&logoColor=white)
![Postgres](https://img.shields.io/badge/Database-Neon_Serverless-00E599?logo=postgresql&logoColor=white)
![AI](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)

> **Live Demo:** [https://monutell.vercel.app](https://monutell.vercel.app)  
> _Note: Designed as a Mobile PWA. For the best experience, open on a mobile device._

---

## 📖 The Problem: "Screen Fatigue" in Travel

Modern tourism has a paradox: We travel to see the world, but we spend most of our time staring at screens reading Wikipedia articles or following maps.

**MonuTell** solves this by providing an "eyes-up" experience. It uses Geolocation to detect landmarks in Budapest and narrates their stories via high-quality AI-generated audio, allowing users to immerse themselves in the environment.

---

## 📸 Screenshots & Features

### 📱 The Mobile Experience

|                             Interactive Map & Audio Player                             |                            Real-Time "Karaoke" Sync                            |
| :------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------: |
|                <img src="./assets/monutell_iphone.jpeg" width="300" />                 |              <img src="./assets/VideoProject.gif" width="300" />               |
| **Interactive Map:** Built with Leaflet & React 19. Tracks user location in real-time. | **Audio Sync:** Custom logic highlights text as the audio plays (0ms latency). |

### 🛠️ The "Kitchen": Admin & Content Pipeline

|                                  Admin Dashboard                                   |                             Terminal Automation Tool                              |
| :--------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------: |
|               <img src="./assets/monutell_admin.png" width="400" />                |             <img src="./assets/otomation_monutell.png" width="400" />             |
| **Crowdsourcing:** Users suggest places, Admins approve/reject via this dashboard. | **Automation:** My custom Node.js CLI generates content using Gemini & Azure TTS. |

---

## 🏗️ System Architecture

This project is not just a UI; it's a full-stack system with a custom automated content pipeline.

```mermaid
graph TD
    subgraph Automation_Pipeline [Phase 1: Content Factory]
        Node(🚀 Node.js CLI) -->|1. Prompt| Gemini(✨ Google Gemini)
        Gemini -->|2. Story Text| Azure(🗣️ Azure Neural TTS)
        Azure -->|3. Audio File| Blob(☁️ Vercel Blob)
        Node -->|4. Save Data & Links| DB[(🛢️ Neon Postgres)]
    end

    subgraph User_App [Phase 2: React Client]
        Client(📱 React 19 PWA) <-->|5. Fetch Data| API(⚡ Vercel Functions)
        API <-->|Query| DB
        Client <-->|6. Stream Audio| Blob
    end
```
