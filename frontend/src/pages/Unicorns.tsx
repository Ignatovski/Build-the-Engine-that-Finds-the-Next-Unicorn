import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';

interface Startup {
  id: number;
  name: string;
  valuation: number;
  industry: string;
  description: string;
}

export default function Unicorns() {
  const [unicorns, setUnicorns] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnicorns = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/startups/');
        const data = await response.json();
        // Filter startups with valuation > $1B
        const unicornStartups = data.filter((startup: Startup) => 
          startup.valuation >= 1000000000
        );
        setUnicorns(unicornStartups);
      } catch (error) {
        console.error('Error fetching unicorns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnicorns();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Unicorn Startups
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Startups valued at $1 billion or more
      </Typography>
      <Grid container spacing={3}>
        {unicorns.map((startup) => (
          <Grid item xs={12} md={6} lg={4} key={startup.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {startup.name}
                </Typography>
                <Typography color="text.secondary">
                  Industry: {startup.industry}
                </Typography>
                <Typography variant="h5" sx={{ mt: 2, color: 'success.main' }}>
                  ${(startup.valuation / 1000000000).toFixed(1)}B
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {startup.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
