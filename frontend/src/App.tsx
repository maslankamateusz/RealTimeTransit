import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MapPage from './pages/MapPage';
import LinesPage from './pages/LinesPage';
import StopsPage from './pages/StopsPage';
import StatisticsPage from './pages/StatisticsPage';
import HomePage from './pages/HomePage';
import LineDetails from './pages/LineDetailsPage';
import StopDetails from './pages/StopDetailsPage';
import VehiclePage from './pages/VehiclePage';
import SchedulePage from './pages/SchedulePage';
import TimetablePage from './pages/TimetablePage';

function App() {
    return (
        <Router>
            <Header />
            <div>
                <Routes>
                    <Route path="/" element={<LinesPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/lines" element={<LinesPage />} />
                    <Route path="/stops" element={<StopsPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/lines/:lineNumber" element={<LineDetails />}/>
                    <Route path="/stop/:stopName" element={<StopDetails />}/>
                    <Route path="/vehicle/:vehicleId" element={<VehiclePage />}/>
                    <Route path="/schedule/:serviceId/:scheduleNumber" element={<SchedulePage />}/>
                    <Route path="/timetable/:lineNumber/:directionId" element={<TimetablePage />}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
