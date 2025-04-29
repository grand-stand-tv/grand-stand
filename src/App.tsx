import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import MainContent from "./MainContent";
import EventDetailsPage from "./EventDetailsPage";
import WatchChannelPage from "./WatchChannelPage";

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/events/:date" element={<MainContent />} />
          <Route path="/events/:date/:sport" element={<MainContent />} />
          <Route
            path="/events/:date/:sport/:search"
            element={<MainContent />}
          />
          <Route path="/event/:eventSlug" element={<EventDetailsPage />} />
          <Route
            path="/watch/:eventSlug/:channelUrl"
            element={<WatchChannelPage />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
