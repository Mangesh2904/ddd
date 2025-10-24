# Edunova Backend

This is the MERN-based backend API for Edunova, using Google Gemini AI for intelligent roadmap generation.

## Quick Start

1. Install dependencies:

```powershell
cd C:\Users\yoges\Desktop\Projects\Edunova\EdunovaBackend
npm install
```

2. Create a `.env` file in `EdunovaBackend` containing:

```env
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/edunova
JWT_SECRET=your_jwt_secret
PORT=3000
```

3. Run the backend:

```powershell
npm start
```

## Features
- Pure Node.js/Express backend with MongoDB
- Google Gemini AI integration for roadmap generation
- Generates structured learning paths with YouTube videos and hands-on projects
- User authentication with JWT
- Roadmap history and feedback system
