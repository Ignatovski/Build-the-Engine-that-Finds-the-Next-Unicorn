import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Chip, CircularProgress } from '@mui/material';

interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  founded_year: number;
  team_size: number;
  funding_stage: string;
  total_funding: number;
  website: string;
  overall_score: number;
}

const StartupDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartupDetails = async () => {
      try {
        const response = await fetch(`/api/v1/startups/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch startup details');
        }
        const data = await response.json();
        setStartup(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStartupDetails();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !startup) {
    return (
      <Box p={3}>
        <Typography color="error">
          {error || 'Startup not found'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                {startup.name}
              </Typography>
              <Chip 
                label={startup.industry} 
                color="primary" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Founded ${startup.founded_year}`}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" paragraph>
                {startup.description}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Details
                  </Typography>
                  <Typography>
                    <strong>Team Size:</strong> {startup.team_size} employees
                  </Typography>
                  <Typography>
                    <strong>Funding Stage:</strong> {startup.funding_stage}
                  </Typography>
                  <Typography>
                    <strong>Total Funding:</strong> ${startup.total_funding.toLocaleString()}
                  </Typography>
                  <Typography>
                    <strong>Website:</strong>{' '}
                    <a href={startup.website} target="_blank" rel="noopener noreferrer">
                      {startup.website}
                    </a>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    AI Analysis Score
                  </Typography>
                  <Box display="flex" alignItems="center" justifyContent="center" p={2}>
                    <Box position="relative" display="inline-flex">
                      <CircularProgress
                        variant="determinate"
                        value={startup.overall_score * 10}
                        size={100}
                        thickness={5}
                      />
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        bottom={0}
                        right={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Typography variant="h5" component="div">
                          {startup.overall_score}/10
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StartupDetails;
