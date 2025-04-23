import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Navigation bar component for the application
 */
export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Startup Analysis Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/startups"
            startIcon={<ListAltIcon />}
          >
            Startups
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/add-startup"
            startIcon={<AddIcon />}
          >
            Add Startup
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/unicorns"
            startIcon={<StarIcon />}
          >
            Unicorns
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/analyze"
            startIcon={<AssessmentIcon />}
          >
            Analyze
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/search"
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
