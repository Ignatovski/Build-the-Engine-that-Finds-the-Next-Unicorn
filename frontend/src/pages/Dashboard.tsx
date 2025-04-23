import { useState, useEffect } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStartups: 0,
    averageScore: 0,
    topIndustries: [],
  });

  useEffect(() => {
    // TODO: Fetch dashboard stats from API
  }, []);

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6">Total Startups</Typography>
            <Typography variant="h3">{stats.totalStartups}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6">Average Score</Typography>
            <Typography variant="h3">{stats.averageScore.toFixed(1)}</Typography>
          </Item>
        </Grid>
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6">Top Industries</Typography>
            <Typography variant="body1">
              {stats.topIndustries.join(', ')}
            </Typography>
          </Item>
        </Grid>
      </Grid>
    </>
  );
}
