import { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Link,
  Chip,
  Container,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
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
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      console.log('Searching for:', searchTerm, 'in industry:', industry);
      const response = await fetch(
        `http://localhost:8000/api/v1/startups/search/ai?query=${encodeURIComponent(searchTerm)}${
          industry !== 'All' ? `&industry=${encodeURIComponent(industry)}` : ''
        }`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Check for API error response
      if (data[0]?.error) {
        throw new Error(data[0].error);
      }

      // Handle Tavily results
      if (!data[0]?.synthetic && Array.isArray(data[0]?.results)) {
        const validResults = data[0].results.filter((item): item is SearchResult => 
          Boolean(item.title && item.url && item.snippet && item.source)
        );

        if (validResults.length === 0) {
          throw new Error('No valid results found');
        }

        setResults(validResults);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error searching startups:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Search Startups
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <TextField
              label="Search Startups"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select
              value={industry}
              label="Industry"
              onChange={(e: SelectChangeEvent) => setIndustry(e.target.value)}
              disabled={isLoading}
            >
              {industries.map((ind) => (
                <MenuItem key={ind} value={ind}>
                  {ind}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            fullWidth
            sx={{ height: '56px' }}
            startIcon={<SearchIcon />}
            disabled={isLoading || !searchTerm.trim()}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          </Grid>
        )}

        <Grid item xs={12}>
          {results.map((result, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  <Link href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {result.snippet}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Source:
                  </Typography>
                  <Chip
                    label={result.source}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {!isLoading && results.length === 0 && !error && searchTerm.trim() && (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center">
              No results found. Try a different search term.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
