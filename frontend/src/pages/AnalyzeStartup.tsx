import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  LinearProgress,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  Lightbulb,
  CheckCircle,
  Upload,
} from '@mui/icons-material';

interface AnalysisResult {
  market_score: number;
  team_score: number;
  technology_score: number;
  traction_score: number;
  overall_score: number;
  success_probability: number;
  unicorn_probability: number;
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

interface FormData {
  name: string;
  description: string | null;
  industry: string | null;
  funding_stage: string | null;
}

export default function AnalyzeStartup() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: null,
    industry: null,
    funding_stage: null
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const industries = [
    'AI/ML',
    'Fintech',
    'Healthcare',
    'E-commerce',
    'Enterprise Software',
    'Clean Tech',
    'Cybersecurity',
    'EdTech',
    'Other',
  ];

  const fundingStages = [
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C',
    'Series D+',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Company name is required');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      console.log('Submitting data:', formData);
      // Convert empty strings to null
      const cleanedData = {
        ...formData,
        description: formData.description || null,
        industry: formData.industry || null,
        funding_stage: formData.funding_stage || null
      };
      console.log('Cleaned data:', cleanedData);
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.detail || 'Failed to analyze startup');
      }

      const data = await response.json();
      
      // Validate the response data before setting it
      if (!data || !data.analysis) {
        throw new Error('Invalid response data received from server');
      }
      
      // Extract the analysis part from the response
      setResult(data.analysis as AnalysisResult);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while analyzing the startup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Analyze Startup Potential
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="name"
                    label="Company Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!formData.name && error !== null}
                    helperText={!formData.name && error !== null ? 'Company name is required' : ''}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    label="Company Description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      name="industry"
                      value={formData.industry || ''}
                      label="Industry"
                      onChange={handleInputChange}
                    >
                      {industries.map(ind => (
                        <MenuItem key={ind} value={ind}>{ind}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Funding Stage</InputLabel>
                    <Select
                      name="funding_stage"
                      value={formData.funding_stage || ''}
                      label="Funding Stage"
                      onChange={handleInputChange}
                    >
                      {fundingStages.map(stage => (
                        <MenuItem key={stage} value={stage}>{stage}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || !formData.name}
                    startIcon={loading ? <CircularProgress size={20} /> : <TrendingUp />}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Potential'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          {loading ? (
            <Box sx={{ width: '100%', mt: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} align="center">
                Analyzing startup data...
              </Typography>
            </Box>
          ) : result ? (
            <Stack spacing={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Analysis Results
                  </Typography>
                  
                  {/* Scores Grid */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">Market Score</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={result.market_score * 10}
                        color={result.market_score >= 7 ? 'success' : result.market_score >= 5 ? 'primary' : 'error'}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="body2">{result.market_score}/10</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">Team Score</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={result.team_score * 10}
                        color={result.team_score >= 7 ? 'success' : result.team_score >= 5 ? 'primary' : 'error'}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="body2">{result.team_score}/10</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">Technology Score</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={result.technology_score * 10}
                        color={result.technology_score >= 7 ? 'success' : result.technology_score >= 5 ? 'primary' : 'error'}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="body2">{result.technology_score}/10</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">Traction Score</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={result.traction_score * 10}
                        color={result.traction_score >= 7 ? 'success' : result.traction_score >= 5 ? 'primary' : 'error'}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="body2">{result.traction_score}/10</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">Overall Score</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={result.overall_score * 10}
                        color={result.overall_score >= 7 ? 'success' : result.overall_score >= 5 ? 'primary' : 'error'}
                        sx={{ height: 8, borderRadius: 5 }}
                      />
                      <Typography variant="body2">{result.overall_score}/10</Typography>
                    </Grid>
                  </Grid>

                  {/* Probability Circles */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={result.success_probability * 100}
                          size={80}
                          color={result.success_probability >= 0.7 ? 'success' : 'primary'}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" component="div" color="text.secondary">
                            {`${Math.round(result.success_probability * 100)}%`}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        Success Rate
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={result.unicorn_probability * 100}
                          size={80}
                          color={result.unicorn_probability >= 0.7 ? 'success' : 'primary'}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="caption" component="div" color="text.secondary">
                            {`${Math.round(result.unicorn_probability * 100)}%`}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                        Unicorn Potential
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                    Key Strengths
                  </Typography>
                  <List>
                    {(result.strengths || ['Innovative business model', 'Strong founding team']).map((strength, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ mr: 1, color: 'warning.main' }} />
                    Major Risks
                  </Typography>
                  <List>
                    {(result.risks || ['Market competition may be intense', 'Regulatory challenges']).map((risk, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={risk} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Lightbulb sx={{ mr: 1, color: 'info.main' }} />
                    Strategic Recommendations
                  </Typography>
                  <List>
                    {(result.recommendations || ['Focus on product differentiation', 'Secure early partnerships']).map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Stack>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Upload sx={{ fontSize: 60, mb: 2, color: 'action.disabled' }} />
              <Typography variant="h6" gutterBottom>
                No Analysis Yet
              </Typography>
              <Typography variant="body2">
                Fill out the form and submit it to analyze the startup's potential
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
