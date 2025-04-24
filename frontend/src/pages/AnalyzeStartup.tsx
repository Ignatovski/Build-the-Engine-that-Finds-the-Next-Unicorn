import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
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
  Link,
  Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import {
  TrendingUp,
  Warning,
  Lightbulb,
  CheckCircle,
  Upload,
  Business,
} from '@mui/icons-material';

interface AnalysisResult {
  market_score: number;
  team_score: number;
  technology_score: number;
  traction_score: number;
  overall_score: number;
  success_probability: number;
  unicorn_probability: number;
  market_growth: number;  // Added for BCG Matrix
  market_potential: number;  // Added for BCG Matrix
  logo_urls?: string[] | null;  // Added for company logo
  website_url: string | null;  // Added for website URL
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

interface FormData {
  name: string;
  description: string | null;
  industry: string | null;
  funding_stage: string | null;
  website: string;
  file?: File | null;
}

const isWikipediaUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.hostname.endsWith('.wikipedia.org') || 
           url.hostname.includes('wikipedia.com') ||
           url.hostname.includes('wiki');
  } catch {
    return false;
  }
};

export default function AnalyzeStartup() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: null,
    industry: null,
    funding_stage: null,
    website: '',
    file: null,
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

  const theme: Theme = useTheme();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Create FormData object for file upload
      const formDataObj = new FormData();
      
      // Add file if present
      if (formData.file) {
        formDataObj.append('file', formData.file);
      }
      
      // Add other form data
      const cleanedData = {
        name: formData.name,
        description: formData.description || null,
        industry: formData.industry || null,
        funding_stage: formData.funding_stage || null,
        website: formData.website || ''
      };
      
      // Add the JSON data
      formDataObj.append('data', JSON.stringify(cleanedData));
      
      console.log('Cleaned data:', cleanedData);
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        body: formDataObj,
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

  const startupName = formData.name;

  const getCompanyLogo = () => {
    try {
      // Check if we have direct logo URLs first
      if (result?.logo_urls?.[0]) {
        return result.logo_urls[0];
      }
      
      // Check if we have a valid website URL
      if (!result?.website_url) {
        throw new Error('No website URL');
      }
      
      // Parse URL and verify it's not from excluded domains
      const url = new URL(result.website_url);
      const excludedDomains = [
        '.wikipedia.org', // Catches all subdomains like en.wikipedia.org
        'wikipedia.com', 
        'wiki',
        'linkedin.com', 
        'crunchbase.com', 
        'glassdoor.com', 
        'indeed.com'
      ];
      
      const isWikipedia = url.hostname.endsWith('.wikipedia.org');
      const isExcluded = excludedDomains.some(domain => 
        url.hostname.toLowerCase().includes(domain.toLowerCase())
      );
      
      const isOriginalDomain = !isWikipedia && !isExcluded;
      
      // For original domains, try Clearbit
      if (isOriginalDomain) {
        return `https://logo.clearbit.com/${url.hostname}?size=120`;
      }
    } catch (e) {
      // Fall through to generated avatar
    }
    
    // Final fallback to generated avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff&size=120`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.9)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
        pt: 4,
        pb: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Fade in={true} timeout={1000}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              mt: 2,
              mb: 4,
              textAlign: 'center',
              fontWeight: 'bold',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '2.5rem',
              letterSpacing: '0.1em',
            }}
          >
            Startup Analysis Platform
          </Typography>
        </Fade>

        {error && (
          <Alert severity="error" sx={{ 
            mb: 2,
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4} justifyContent="center">
          {/* Input Form */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                borderRadius: '16px',
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.18)'
              }}
            >
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
                      label="Website URL"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
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
                  <Grid item xs={12}>
                    <input
                      accept=".pdf,.pptx"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFormData(prev => ({ ...prev, file }));
                      }}
                    />
                    <label htmlFor="raised-button-file">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<Upload />}
                        fullWidth
                      >
                        Upload Company Documents (PDF/PPTX)
                      </Button>
                    </label>
                    {formData.file && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        Selected file: {formData.file.name}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Industry</InputLabel>
                      <Select
                        name="industry"
                        value={formData.industry || ''}
                        label="Industry"
                        onChange={(e: SelectChangeEvent) => {
                          const { name, value } = e.target;
                          setFormData(prev => ({ ...prev, [name]: value }));
                          setError(null);
                        }}
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
                        onChange={(e: SelectChangeEvent) => {
                          const { name, value } = e.target;
                          setFormData(prev => ({ ...prev, [name]: value }));
                          setError(null);
                        }}
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
                {result && (
                  <Box sx={{ mt: 4 }}>
                    {/* Company Header Card */}
                    <Card sx={{ borderRadius: '16px', mb: 3 }}>
                      <CardContent sx={{ p: '24px !important' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 3,
                          mb: 2
                        }}>
                          <Box sx={{ 
                            width: 72, 
                            height: 72,
                            flexShrink: 0,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.1)' 
                              : 'rgba(0,0,0,0.05)'
                          }}>
                            <img 
                              src={getCompanyLogo()}
                              alt="Company logo" 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff&size=120`;
                              }}
                            />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h5" noWrap sx={{ mb: 1, fontWeight: 600 }}>
                              {startupName}
                            </Typography>
                            {result.website_url && (
                              <Typography variant="body2" color="text.secondary" noWrap>
                                <Link 
                                  href={result.website_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  color="inherit"
                                  sx={{ 
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                >
                                  {new URL(result.website_url).hostname.replace('www.', '')}
                                </Link>
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        
                        {/* Scores Grid */}
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">Market</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={result.market_score * 10}
                              color={result.market_score >= 7 ? 'success' : result.market_score >= 5 ? 'primary' : 'error'}
                              sx={{ height: 8, borderRadius: 5, mb: 0.5 }}
                            />
                            <Typography variant="body2">{result.market_score}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">Team</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={result.team_score * 10}
                              color={result.team_score >= 7 ? 'success' : result.team_score >= 5 ? 'primary' : 'error'}
                              sx={{ height: 8, borderRadius: 5, mb: 0.5 }}
                            />
                            <Typography variant="body2">{result.team_score}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">Tech</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={result.technology_score * 10}
                              color={result.technology_score >= 7 ? 'success' : result.technology_score >= 5 ? 'primary' : 'error'}
                              sx={{ height: 8, borderRadius: 5, mb: 0.5 }}
                            />
                            <Typography variant="body2">{result.technology_score}/10</Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="subtitle2" color="text.secondary">Overall</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={result.overall_score * 10}
                              color={result.overall_score >= 7 ? 'success' : result.overall_score >= 5 ? 'primary' : 'error'}
                              sx={{ height: 8, borderRadius: 5, mb: 0.5 }}
                            />
                            <Typography variant="body2">{result.overall_score}/10</Typography>
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

                    {/* BCG Matrix */}
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                            Analysis Results
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 400,
                            position: 'relative',
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            p: 2,
                            backgroundColor: '#f5f5f5'
                          }}
                        >
                          {/* Quadrant Labels */}
                          <Typography
                            sx={{
                              position: 'absolute',
                              top: '10%',
                              right: '25%',
                              fontWeight: 'bold',
                              color: 'success.main'
                            }}
                          >
                            Stars
                          </Typography>
                          <Typography
                            sx={{
                              position: 'absolute',
                              top: '10%',
                              left: '25%',
                              fontWeight: 'bold',
                              color: 'warning.main'
                            }}
                          >
                            Question Marks
                          </Typography>
                          <Typography
                            sx={{
                              position: 'absolute',
                              bottom: '10%',
                              right: '25%',
                              fontWeight: 'bold',
                              color: 'info.main'
                            }}
                          >
                            Cash Cows
                          </Typography>
                          <Typography
                            sx={{
                              position: 'absolute',
                              bottom: '10%',
                              left: '25%',
                              fontWeight: 'bold',
                              color: 'error.main'
                            }}
                          >
                            Dogs
                          </Typography>

                          {/* Axes */}
                          <Box
                            sx={{
                              position: 'absolute',
                              left: '50%',
                              top: 0,
                              bottom: 0,
                              borderLeft: '1px dashed #ccc'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: 0,
                              right: 0,
                              borderTop: '1px dashed #ccc'
                            }}
                          />

                          {/* Company Position */}
                          <Box
                            sx={{
                              position: 'absolute',
                              left: `${Math.min(Math.max((result.market_potential || 0.5) * 100, 5), 95)}%`,
                              bottom: `${Math.min(Math.max((result.market_growth || 0.5) * 100, 5), 95)}%`,
                              transform: 'translate(-50%, 50%)',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                              border: '2px solid white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              zIndex: 2,
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translate(-50%, 50%) scale(1.1)',
                                boxShadow: '0 0 15px rgba(0,0,0,0.4)',
                              }
                            }}
                          >
                            {formData.name?.[0]?.toUpperCase() || '?'}
                          </Box>

                          {/* Quadrant Backgrounds with Gradients */}
                          <Box sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: '50%',
                            height: '50%',
                            background: 'linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0.05) 100%)',
                            borderTop: '1px solid rgba(76,175,80,0.2)',
                            borderRight: '1px solid rgba(76,175,80,0.2)'
                          }} />
                          <Box sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '50%',
                            height: '50%',
                            background: 'linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(255,152,0,0.05) 100%)',
                            borderTop: '1px solid rgba(255,152,0,0.2)',
                            borderLeft: '1px solid rgba(255,152,0,0.2)'
                          }} />
                          <Box sx={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            width: '50%',
                            height: '50%',
                            background: 'linear-gradient(135deg, rgba(33,150,243,0.15) 0%, rgba(33,150,243,0.05) 100%)',
                            borderBottom: '1px solid rgba(33,150,243,0.2)',
                            borderRight: '1px solid rgba(33,150,243,0.2)'
                          }} />
                          <Box sx={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            width: '50%',
                            height: '50%',
                            background: 'linear-gradient(135deg, rgba(244,67,54,0.15) 0%, rgba(244,67,54,0.05) 100%)',
                            borderBottom: '1px solid rgba(244,67,54,0.2)',
                            borderLeft: '1px solid rgba(244,67,54,0.2)'
                          }} />

                          {/* Axis Labels */}
                          <Typography
                            sx={{
                              position: 'absolute',
                              bottom: -30,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              textAlign: 'center',
                              fontSize: '0.875rem',
                              color: 'text.secondary'
                            }}
                          >
                            Market Potential
                          </Typography>
                          <Typography
                            sx={{
                              position: 'absolute',
                              left: -40,
                              top: '50%',
                              transform: 'translateY(-50%) rotate(-90deg)',
                              textAlign: 'center',
                              fontSize: '0.875rem',
                              color: 'text.secondary'
                            }}
                          >
                            Market Growth
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                )}
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
      {result && (
        <Box sx={{ 
          position: 'fixed', 
          left: 16, 
          bottom: 16,
          zIndex: 1000,
          width: '300px'
        }}>
          <Card sx={{ 
            borderRadius: '16px', 
            boxShadow: 'none', 
            border: `1px solid ${theme.palette.divider}` 
          }}>
            <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Company Logo */}
              <Box sx={{ 
                width: 60, 
                height: 60,
                flexShrink: 0,
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img 
                  src={getCompanyLogo()}
                  alt="Company logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff&size=120`;
                  }}
                />
              </Box>
              
              {/* Company Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>
                  {startupName}
                </Typography>
                {result.website_url && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    <Link 
                      href={result.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="inherit"
                      sx={{ 
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {new URL(result.website_url).hostname.replace('www.', '')}
                    </Link>
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
