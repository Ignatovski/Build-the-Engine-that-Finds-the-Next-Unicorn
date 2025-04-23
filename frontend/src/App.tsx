import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Pages
import Dashboard from './pages/Dashboard';
import StartupList from './pages/StartupList';
import StartupDetails from './pages/StartupDetails';
import AddStartup from './pages/AddStartup';
import Unicorns from './pages/Unicorns';
import Search from './pages/Search';

// Components
import Navbar from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/startups" element={<StartupList />} />
            <Route path="/startups/:id" element={<StartupDetails />} />
            <Route path="/add-startup" element={<AddStartup />} />
            <Route path="/unicorns" element={<Unicorns />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
