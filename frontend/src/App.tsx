import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MapPage from './pages/MapPage';
import LinesPage from './pages/LinesPage';
import StopsPage from './pages/StopsPage';
import StatisticsPage from './pages/StatisticsPage';
import HomePage from './pages/HomePage';
import LineDetails from './pages/LineDetailsPage';
import StopDetails from './pages/StopDetailsPage';

function App() {
    return (
        <Router>
            <Header />
            <div>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/lines" element={<LinesPage />} />
                    <Route path="/stops" element={<StopsPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/lines/:lineNumber" element={<LineDetails />}/>
                    <Route path="/stop/:stopName" element={<StopDetails />}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
