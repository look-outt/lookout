# LinkedOut - AI-Powered LinkedIn Content Creation Platform

LinkedOut is a comprehensive platform that helps users create engaging LinkedIn content with AI assistance. The platform features user registration, personalized onboarding, and an AI-powered chatbot for content creation.

## 🚀 Quick Start

### Automated Launch (Recommended)

Use our launcher scripts to automatically set up dependencies and start both frontend and backend:

#### For macOS/Linux:
```bash
chmod +x start.sh
./start.sh
```

#### For Windows:
```cmd
start.bat
```

The launcher will:
- ✅ Check if Node.js and npm are installed
- 📦 Install frontend and backend dependencies if needed
- 🚀 Start both services concurrently
- 🌐 Open frontend on http://localhost:3000
- ⚙️ Start backend on http://localhost:3001

### Manual Setup

If you prefer to run services manually:

#### 1. Install Dependencies
```bash
# Install frontend dependencies
cd "front end/linkedout-pg1"
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

#### 2. Start Services
```bash
# From the frontend directory (front end/linkedout-pg1)
npm run start    # Starts both frontend and backend
# OR
npm run dev      # Frontend only
npm run server   # Backend only
```

## 📁 Project Structure

```
linkedout-merge/
├── start.sh              # Launch script for macOS/Linux
├── start.bat             # Launch script for Windows
├── README.md             # This file
└── front end/
    └── linkedout-pg1/
        ├── src/           # React frontend source
        ├── server/        # Express backend
        ├── package.json   # Frontend dependencies
        └── README.md      # Frontend-specific docs
```

## 🌟 Features

### User Registration & Onboarding
- Secure user registration with validation
- Comprehensive questionnaire for personalization
- Profile preferences (role, niche, content style, tone)

### AI-Powered Chatbot
- Personalized content assistant (Ollie)
- Context-aware responses based on user preferences
- LinkedIn content generation and suggestions

### User Flow
1. **Registration** → Create account with profile details
2. **Onboarding** → Complete preference questionnaire
3. **Chatbot** → Access personalized AI assistant

## 🛠️ Technology Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **AI Integration**: Custom AI service integration
- **Authentication**: JWT tokens
- **Development**: Concurrently for running multiple services

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## 🎯 Development

### Available Scripts

From `front end/linkedout-pg1/`:

- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start backend server only
- `npm run start` - Start both frontend and backend
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

### API Endpoints

Backend runs on http://localhost:3001 with endpoints:
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `POST /api/questionnaire` - Save onboarding preferences
- `GET /api/questionnaire-status` - Get user questionnaire status
- And more...

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is part of the LinkedOut platform development.

---

For questions or support, please refer to the project documentation or create an issue in the repository.