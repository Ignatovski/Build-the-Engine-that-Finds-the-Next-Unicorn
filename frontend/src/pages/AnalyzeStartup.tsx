import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  Lightbulb,
  Upload,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

interface AnalysisResult {
  success_probability: number;
  unicorn_probability: number;
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

export default function AnalyzeStartup() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    funding_stage: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    'Unknown',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add startup data
      formDataToSend.append('startup', JSON.stringify(formData));
      
      // Add files
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('/api/v1/startups/analyze', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing startup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Analyze Startup Potential
      </Typography>

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
                      value={formData.industry}
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
                      value={formData.funding_stage}
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
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                  >
                    Upload Documents (PDF, TXT)
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    multiple
                    accept=".pdf,.txt"
                  />
                  {files.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Selected files:
                      </Typography>
                      <List dense>
                        {files.map((file, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircle color="success" />
                            </ListItemIcon>
                            <ListItemText primary={file.name} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
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
            <Box sx={{ width: '100%', mt: 4 }}>
              <LinearProgress />
              <Typography sx={{ mt: 2 }} align="center">
                Analyzing startup data and searching web information...
              </Typography>
            </Box>
          ) : result ? (
            <Grid container spacing={2}>
              {/* Probabilities */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Success Probabilities
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={result.success_probability}
                            size={80}
                            color={result.success_probability >= 70 ? 'success' : 'primary'}
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
                              {`${Math.round(result.success_probability)}%`}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Success Rate
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={result.unicorn_probability}
                            size={80}
                            color={result.unicorn_probability >= 70 ? 'success' : 'primary'}
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
                              {`${Math.round(result.unicorn_probability)}%`}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Unicorn Potential
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Strengths */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                      Key Strengths
                    </Typography>
                    <List>
                      {result.strengths.map((strength, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Risks */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Warning sx={{ mr: 1, color: 'warning.main' }} />
                      Major Risks
                    </Typography>
                    <List>
                      {result.risks.map((risk, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={risk} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recommendations */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Lightbulb sx={{ mr: 1, color: 'info.main' }} />
                      Strategic Recommendations
                    </Typography>
                    <List>
                      {result.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Upload sx={{ fontSize: 60, mb: 2, color: 'action.disabled' }} />
              <Typography variant="h6" gutterBottom>
                No Analysis Yet
              </Typography>
              <Typography variant="body2">
                Fill out the form and upload relevant documents to analyze the startup's potential
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
