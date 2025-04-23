import { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Startup {
  id: number;
  name: string;
  industry: string;
  description: string;
  valuation: number;
  tech_stack: string[];
}

const industries = [
  'All',
  'AI/ML',
  'Fintech',
  'Healthcare',
  'E-commerce',
  'Enterprise Software',
  'Cybersecurity',
  'Clean Tech',
  'EdTech',
  'Gaming',
];

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [industry, setIndustry] = useState('All');
  const [results, setResults] = useState<Startup[]>([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/startups/search/ai?query=${encodeURIComponent(searchTerm)}${
          industry !== 'All' ? `&industry=${encodeURIComponent(industry)}` : ''
        }`
      );
      
      const data = await response.json();
      
      // Parse the AI-generated results
      if (data[0].synthetic) {
        // Handle synthetic data
        const syntheticResults = data[0].results
          .split('\n\n')
          .filter(Boolean)
          .map((result: string) => ({
            name: result.split('\n')[0],
            description: result.split('\n').slice(1).join('\n')
          }));
        setResults(syntheticResults);
      } else {
        // Handle real data with AI suggestions
        const aiResults = data[0].results
          .split('\n\n')
          .filter(Boolean)
          .map((result: string) => {
            const lines = result.split('\n');
            return {
              name: lines[0],
              description: lines.slice(1).join('\n')
            };
          });
        setResults(aiResults);
      }
    } catch (error) {
      console.error('Error searching startups:', error);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Search Startups
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search startups"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select
              value={industry}
              label="Industry"
              onChange={(e: SelectChangeEvent) => setIndustry(e.target.value)}
            >
              {industries.map((ind) => (
                <MenuItem key={ind} value={ind}>{ind}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{ height: '56px' }}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {results.map((startup) => (
          <Grid item xs={12} md={6} key={startup.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {startup.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {startup.industry}
                </Typography>
                <Typography variant="body2" paragraph>
                  {startup.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {startup.tech_stack?.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
