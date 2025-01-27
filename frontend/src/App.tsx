import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MapPage from './pages/MapPage';
import LinesPage from './pages/LinesPage';
import StopsPage from './pages/StopsPage';
import StatisticsPage from './pages/StatisticsPage';
import HomePage from './pages/HomePage';
import LineDetails from './pages/LineDetailsPage';

function App() {
    return (
        <Router>
            <Header />
            <div className="p-4">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/lines" element={<LinesPage />} />
                    <Route path="/stops" element={<StopsPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/lines/:lineNumber" element={<LineDetails />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
