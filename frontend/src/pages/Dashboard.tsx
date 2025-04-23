import { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { green, blue, orange } from '@mui/material/colors';

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '& .MuiCardContent-root': {
    flexGrow: 1,
  },
}));

const ScoreBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  marginTop: theme.spacing(1),
}));

interface Startup {
  name: string;
  industry: string;
  valuation: string;
  tech_stack: string[];
  description: string;
  team_size?: number;
  scores?: {
    market: number;
    team: number;
    tech: number;
    traction: number;
    overall: number;
  };
}

export default function Dashboard() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    industry: 'All',
    valuation: 'All',
    techStack: 'All',
  });

  const industries = ['All', 'Healthcare', 'Fintech', 'Clean Tech', 'AI/ML', 'EdTech', 'Cybersecurity'];
  const valuationRanges = ['All', '< $100M', '$100M - $500M', '$500M - $1B', '> $1B'];
  const techStacks = ['All', 'AI/ML', 'Blockchain', 'Cloud', 'Mobile', 'IoT'];

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/startups/');
        const data = await response.json();
        
        // Parse the results from the synthetic data
        const parsedStartups = data[0]?.results.split('\n\n')
          .filter(Boolean)
          .map((startupText: string) => {
            const lines = startupText.split('\n');
            const name = lines[0].trim();
            const description = lines[1];
            const industryMatch = description.match(/Industry: ([^.]+)/);
            const techStackMatch = description.match(/Tech Stack: ([^.]+)/);
            const valuationMatch = description.match(/Valuation: \$([0-9.]+)([BM])/);
            
            return {
              name,
              description,
              industry: industryMatch ? industryMatch[1].trim() : 'Unknown',
              tech_stack: techStackMatch ? techStackMatch[1].split(', ').map(t => t.trim()) : [],
              valuation: valuationMatch ? `$${valuationMatch[1]}${valuationMatch[2]}` : 'Unknown',
              scores: {
                market: Math.random() * 40 + 60,
                team: Math.random() * 40 + 60,
                tech: Math.random() * 40 + 60,
                traction: Math.random() * 40 + 60,
                overall: Math.random() * 40 + 60,
              }
            };
          });
        
        setStartups(parsedStartups);
        setFilteredStartups(parsedStartups);
      } catch (error) {
        console.error('Failed to fetch startups:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStartups();
  }, []);

  useEffect(() => {
    let filtered = [...startups];
    
    if (filters.industry !== 'All') {
      filtered = filtered.filter(s => s.industry === filters.industry);
    }
    
    if (filters.valuation !== 'All') {
      filtered = filtered.filter(s => {
        const val = parseFloat(s.valuation.replace(/[^0-9.]/g, ''));
        const unit = s.valuation.includes('B') ? 1000 : 1;
        const valInMillions = val * unit;
        
        switch (filters.valuation) {
          case '< $100M': return valInMillions < 100;
          case '$100M - $500M': return valInMillions >= 100 && valInMillions < 500;
          case '$500M - $1B': return valInMillions >= 500 && valInMillions < 1000;
          case '> $1B': return valInMillions >= 1000;
          default: return true;
        }
      });
    }
    
    if (filters.techStack !== 'All') {
      filtered = filtered.filter(s => 
        s.tech_stack.some(tech => tech.includes(filters.techStack))
      );
    }
    
    setFilteredStartups(filtered);
  }, [filters, startups]);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStats = () => {
    const total = filteredStartups.length;
    const avgValuation = filteredStartups.reduce((acc, s) => {
      const val = parseFloat(s.valuation.replace(/[^0-9.]/g, ''));
      const unit = s.valuation.includes('B') ? 1000 : 1;
      return acc + (val * unit);
    }, 0) / total;

    const avgScores = {
      market: 0,
      team: 0,
      tech: 0,
      traction: 0,
      overall: 0,
    };

    filteredStartups.forEach(s => {
      if (s.scores) {
        avgScores.market += s.scores.market;
        avgScores.team += s.scores.team;
        avgScores.tech += s.scores.tech;
        avgScores.traction += s.scores.traction;
        avgScores.overall += s.scores.overall;
      }
    });

    Object.keys(avgScores).forEach(key => {
      avgScores[key as keyof typeof avgScores] /= total;
    });

    return { total, avgValuation, avgScores };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Startup Analysis Dashboard
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select
              name="industry"
              value={filters.industry}
              label="Industry"
              onChange={handleFilterChange}
            >
              {industries.map(ind => (
                <MenuItem key={ind} value={ind}>{ind}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Valuation</InputLabel>
            <Select
              name="valuation"
              value={filters.valuation}
              label="Valuation"
              onChange={handleFilterChange}
            >
              {valuationRanges.map(range => (
                <MenuItem key={range} value={range}>{range}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Tech Stack</InputLabel>
            <Select
              name="techStack"
              value={filters.techStack}
              label="Tech Stack"
              onChange={handleFilterChange}
            >
              {techStacks.map(tech => (
                <MenuItem key={tech} value={tech}>{tech}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: green[500], mr: 1 }} />
                <Typography variant="h6">Total Startups</Typography>
              </Box>
              <Typography variant="h3">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                in selected filters
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyIcon sx={{ color: blue[500], mr: 1 }} />
                <Typography variant="h6">Average Valuation</Typography>
              </Box>
              <Typography variant="h3">
                ${(stats.avgValuation / 1000).toFixed(1)}B
              </Typography>
              <Typography variant="body2" color="text.secondary">
                across portfolio
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkIcon sx={{ color: orange[500], mr: 1 }} />
                <Typography variant="h6">Top Industries</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Array.from(new Set(filteredStartups.map(s => s.industry)))
                  .slice(0, 3)
                  .map(industry => (
                    <Chip 
                      key={industry} 
                      label={industry} 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))
                }
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Scores Table */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Average Scores
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell align="right">Score</TableCell>
              <TableCell>Progress</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(stats.avgScores).map(([category, score]) => (
              <TableRow key={category}>
                <TableCell component="th" scope="row" sx={{ textTransform: 'capitalize' }}>
                  {category}
                </TableCell>
                <TableCell align="right">{score.toFixed(1)}</TableCell>
                <TableCell sx={{ width: '50%' }}>
                  <ScoreBar 
                    variant="determinate" 
                    value={score} 
                    color={score >= 80 ? 'success' : score >= 60 ? 'primary' : 'warning'}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Startup List */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Top Startups
      </Typography>
      <Grid container spacing={2}>
        {filteredStartups
          .sort((a, b) => (b.scores?.overall || 0) - (a.scores?.overall || 0))
          .slice(0, 6)
          .map((startup, index) => (
            <Grid item xs={12} md={6} lg={4} key={startup.name}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {startup.valuation}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {startup.tech_stack.slice(0, 2).map(tech => (
                        <Chip key={tech} label={tech} size="small" />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </>
  );
}
