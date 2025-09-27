import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import WritePostPage from './pages/WritePostPage.jsx';
import PastEventsPage from './pages/PastEventsPage.jsx';
import WaitlistPage from './pages/WaitlistPage.jsx';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/community" element={<CommunityPage />} />
				<Route path="/write-post" element={<WritePostPage />} />
			<Route path="/past-events" element={<PastEventsPage />} />
			<Route path="/waitlist" element={<WaitlistPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;

