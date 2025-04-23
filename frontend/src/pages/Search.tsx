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
  id?: number;
  name: string;
  industry?: string;
  description: string;
  valuation?: string;
  tech_stack?: string[];
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
    if (!searchTerm.trim()) return;
    
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/startups/search/ai?query=${encodeURIComponent(searchTerm)}${
          industry !== 'All' ? `&industry=${encodeURIComponent(industry)}` : ''
        }`
      );
      
      const data = await response.json();
      
      // Handle case where data isn't an array or is empty
      if (!Array.isArray(data) || data.length === 0) {
        console.error('Unexpected API response format:', data);
        setResults([]);
        return;
      }
      
      // Handle real Tavily results
      if (!data[0]?.synthetic && Array.isArray(data[0]?.results)) {
        setResults(data[0].results.filter(item => 
          item.title && item.url && item.snippet
        ));
      } else if (data[0]?.synthetic) {
        // Fallback for synthetic data (should not happen in production)
        setResults([]);
      } else {
        // Handle real data with AI suggestions
        const aiResults = data[0]?.results
          .split('\n\n')
          .filter(Boolean)
          .map((result: string, index: number) => {
            const lines = result.split('\n');
            const name = lines[0].trim();
            const description = lines.slice(1).join('\n');
            
            // Try to extract industry and tech stack from description
            const industryMatch = description.match(/Industry:\s*([^.]+)/);
            const techStackMatch = description.match(/Tech Stack:\s*([^.]+)/);
            
            return {
              id: index, // Generate an id for each result
              name,
              description,
              industry: industryMatch ? industryMatch[1].trim() : undefined,
              tech_stack: techStackMatch ? techStackMatch[1].split(',').map(t => t.trim()) : [],
            };
          });
        setResults(aiResults);
      }
    } catch (error) {
      console.error('Error searching startups:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Search Startups
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Search for startups"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select
              value={industry}
              label="Industry"
              onChange={e => setIndustry(e.target.value)}
            >
              {industries.map(ind => (
                <MenuItem key={ind} value={ind}>{ind}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSearch}
            sx={{ height: '100%' }}
          >
            Search
          </Button>
        </Grid>
      </Grid>

      {/* Results */}
      <Grid container spacing={2}>
        {results.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" align="center">
              No results yet. Try searching for a company or keyword.
            </Typography>
          </Grid>
        ) : (
          results.map((result: any, idx: number) => (
            <Grid item xs={12} md={6} lg={4} key={idx}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      {result.title || 'Untitled'}
                    </a>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {result.snippet}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Source: {result.source || 'Unknown'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}
