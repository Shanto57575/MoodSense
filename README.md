# MoodTracker App

A mood tracking application built with React Native and Expo, using Groq AI for mood analysis. This app helps users track and analyze their daily moods through an intuitive interface.

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shanto57575/MoodSense
cd moodtracker
```

### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Start the Expo development server
npm start

# Scan the QR code with Expo Go app on your mobile device
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create .env file and add your Groq API key & PORT
GROQ_API_KEY=your_groq_api_key_here
PORT=3000

# Start the backend server
npm run dev
```

## Prerequisites

- Node.js
- npm
- Expo Go app installed on your mobile device
- Groq AI API key

## Project Structure

```
moodtracker/
│
│   ├── App.tsx
│   └── package.json
│
└── backend/
    ├── index.ts
    └── package.json
```

## Tech Stack

### Frontend

- React Native
- TypeScript
- Expo
- React Native Chart Kit (for mood visualization)
- AsyncStorage (for local data persistence)

### Backend

- Node.js
- Express.js
- TypeScript
- Groq AI SDK (alternative to OpenAI)

## Key Features

- Daily mood tracking with customizable intensity
- Mood visualization using charts
- AI-powered mood analysis using Groq AI
- Local storage to save past mood entries and insights
- Simple and intuitive user interface

## Technical Decisions

1. **Expo Framework**: Chosen for rapid development and easy testing across platforms
2. **Groq AI**: Selected as an alternative to OpenAI due to cost considerations and availability of free tier
3. **AsyncStorage**: Used for local data persistence to ensure offline functionality
4. **TypeScript**: Implemented for better type safety and development experience

## Challenges and Solutions

1. **API Integration**

   - Challenge: Transitioning from OpenAI to Groq AI
   - Solution: Adapted the API integration to work with Groq's SDK while maintaining similar functionality

2. **Data Persistence**
   - Challenge: Maintaining user data between sessions
   - Solution: Implemented AsyncStorage for reliable local data storage

## Notes

- All mood data is stored locally on the device
- Groq AI API is used as an alternative to OpenAI since OpenAI no longer offers a free tier

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are properly installed
2. Verify your Groq API key is correctly set in the `.env` file
3. Make sure both frontend and backend servers are running
4. Check your mobile device is connected to the same network as your development machine
