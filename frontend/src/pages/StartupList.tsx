import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Startup {
  id: number;
  name: string;
  industry: string;
  location: string;
  overall_score: number;
}

export default function StartupList() {
  const [startups, setStartups] = useState<Startup[]>([]);

  useEffect(() => {
    // TODO: Fetch startups from API
    const fetchStartups = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/startups/');
        const data = await response.json();
        setStartups(data);
      } catch (error) {
        console.error('Error fetching startups:', error);
      }
    };

    fetchStartups();
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Startups
        </Typography>
        <Button
          component={Link}
          to="/add-startup"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Startup
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {startups.map((startup) => (
              <TableRow
                key={startup.id}
                component={Link}
                to={`/startups/${startup.id}`}
                sx={{
                  textDecoration: 'none',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                <TableCell>{startup.name}</TableCell>
                <TableCell>{startup.industry}</TableCell>
                <TableCell>{startup.location}</TableCell>
                <TableCell align="right">
                  {startup.overall_score?.toFixed(1) || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
