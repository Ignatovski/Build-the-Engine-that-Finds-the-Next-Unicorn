import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';

interface StartupFormData {
  name: string;
  description: string;
  industry: string;
  founded_year: string;
  team_size: string;
  funding_stage: string;
  total_funding: string;
  website: string;
}

const industries = [
  'AI/ML',
  'Fintech',
  'Healthcare',
  'E-commerce',
  'Enterprise Software',
  'Cybersecurity',
  'Clean Tech',
  'EdTech',
  'Gaming',
  'Other'
];

const fundingStages = [
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'IPO'
];

const AddStartup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StartupFormData>({
    name: '',
    description: '',
    industry: '',
    founded_year: '',
    team_size: '',
    funding_stage: '',
    total_funding: '',
    website: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/startups/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          founded_year: parseInt(formData.founded_year),
          team_size: parseInt(formData.team_size),
          total_funding: parseFloat(formData.total_funding)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create startup');
      }

      const data = await response.json();
      setSuccess(true);
      setTimeout(() => {
        navigate(`/startups/${data.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Add New Startup
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="name"
                  label="Startup Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="industry"
                  label="Industry"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  {industries.map(industry => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  name="founded_year"
                  label="Founded Year"
                  type="number"
                  value={formData.founded_year}
                  onChange={handleChange}
                  inputProps={{ min: 1900, max: new Date().getFullYear() }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  name="team_size"
                  label="Team Size"
                  type="number"
                  value={formData.team_size}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="funding_stage"
                  label="Funding Stage"
                  value={formData.funding_stage}
                  onChange={handleChange}
                >
                  {fundingStages.map(stage => (
                    <MenuItem key={stage} value={stage}>
                      {stage}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  name="total_funding"
                  label="Total Funding ($)"
                  type="number"
                  value={formData.total_funding}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  name="website"
                  label="Website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Add Startup
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          Startup added successfully! Redirecting...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddStartup;
