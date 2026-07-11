import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/pages/HomePage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import WritePostPage from './pages/WritePostPage.jsx';
import PastEventsPage from './pages/PastEventsPage.jsx';
import WaitlistPage from './pages/WaitlistPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import QuestionnairePage from './pages/QuestionnairePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Public pages */}
				<Route path="/" element={<HomePage />} />
				<Route path="/community" element={<CommunityPage />} />
				<Route path="/write-post" element={<WritePostPage />} />
				<Route path="/past-events" element={<PastEventsPage />} />
				<Route path="/waitlist" element={<WaitlistPage />} />

				{/* Auth pages */}
				<Route path="/login" element={<LoginPage />} />
				<Route path="/signup" element={<SignupPage />} />
				<Route path="/onboarding" element={<QuestionnairePage />} />

				{/* Protected chatbot */}
				<Route
					path="/create"
					element={
						<ProtectedRoute>
							<ChatPage />
						</ProtectedRoute>
					}
				/>

				{/* Fallback */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
