# FIXMYAREA AI

![FixMyArea AI](https://img.shields.io/badge/Status-Live-success)
![Built with Google AI Studio](https://img.shields.io/badge/Built%20with-Google%20AI%20Studio-blue)
![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20Vision-purple)

**FIXMYAREA AI** is a comprehensive, AI-powered Civic Issue Reporting and Management Platform designed to bridge the gap between citizens and local authorities.

This project was built for the **Vibe2Ship Hackathon** using Google AI Studio.

## 🚀 Live Demo

**LIVE:** [https://untitled-1035348437563.us-west1.run.app](https://untitled-1035348437563.us-west1.run.app)

## 📖 Overview

Traditional civic reporting methods are slow, manual, and often lack transparency. Authorities struggle to prioritize issues because they lack immediate, categorized data.

FIXMYAREA AI provides a centralized platform where citizens can drop a pin on a map and upload a photo of an issue (like a pothole or broken streetlight). The platform instantly analyzes the problem, categorizes it, and assigns a severity score using **Gemini Vision AI**.

### Key Impacts

- **Faster response times** from authorities due to automated AI triaging.
- **Increased citizen engagement** through transparent, public issue tracking and upvoting mechanisms.
- **Safer communities** with highly accurate, real-time mapping of infrastructural hazards.

## ✨ Features

- **AI Automated Triage:** Uses the Gemini Vision API to analyze uploaded images, identify the issue type, and assess severity automatically.
- **AI Emergency Detection & Action Plans:** The AI flags emergency situations (e.g. exposed wires), gives temporary safety precautions for citizens, and generates an exact Action Plan for authorities.
- **City Health Score:** A live dashboard calculates a dynamic "Health Score" based on the ratio of resolved to open issues in the area.
- **Department Performance Scorecard:** Real-time metrics showing which departments are resolving issues the fastest.
- **Interactive Map Center:** Built with Google Maps Platform to precisely locate and visualize civic issues across the city.
- **One-Click PDF Generation:** Export dashboard statistics and recent reports into a PDF with a single click.
- **Real-Time Dashboard:** Powered by Firebase Firestore for real-time synchronization of new reports and community upvotes.
- **Secure Authentication:** Firebase Auth ensures that citizens and admins can securely access the platform.
- **Mobile-First Design:** Fully responsive UI built with Tailwind CSS and Shadcn UI, allowing citizens to report issues directly from the street.
- **Beautiful Loading Animations:** Smooth skeleton screens and seamless transitions enhance the user experience while data loads.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **AI & Automation:** Google AI Studio (Antigravity Agent), Gemini Vision API
- **Mapping:** Google Maps Platform (`@vis.gl/react-google-maps`)
- **Backend & Database:** Firebase Authentication, Cloud Firestore

## 📂 Project Structure

- `/src/pages`: Contains the main application views (Map Center, Report Issue, Dashboard).
- `/components`: Reusable UI components and layout wrappers.
- `/lib`: Firebase configuration and utility functions.
- `Vibe2Ship_Submission_Document.md`: Detailed hackathon submission breakdown.

## 🚀 Getting Started (Local Development)

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd fixmyarea
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add your API keys:

   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   # Add other Firebase config variables as needed
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🏆 Hackathon Submission

This project is an official submission for the Vibe2Ship Hackathon. Read the full evaluation matrix and technical breakdown in the [Submission Document](Vibe2Ship_Submission_Document.md).

---

_Developed by Raj Chaudhary for Vibe2Ship 2026_
