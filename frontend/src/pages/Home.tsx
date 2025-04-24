import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Link,
  Divider,
  Grid,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

interface Article {
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
  };
  timeAgo: string;
}

interface NewsResponse {
  articles: Article[];
}

export default function Home() {
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/startup-news?page=1&page_size=4');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data);
        setError(null);
      } catch (err) {
        setError('Error loading startup news');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ 
      py: 6,
      background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(135deg, #121212 0%, #1E1E1E 100%)' 
        : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)'
    }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{
          mb: 6,
          textAlign: 'center',
          fontWeight: 700,
          letterSpacing: 1,
          color: theme.palette.text.primary,
          position: 'relative',
          '&:after': {
            content: '""',
            display: 'block',
            width: '80px',
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            margin: '16px auto 0',
            borderRadius: '2px'
          }
        }}
      >
        Startup News Feed
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress size={80} thickness={2.5} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          mb: 6,
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {error}
        </Alert>
      ) : news && (
        <Grid container spacing={4} justifyContent="center">
          {news.articles.map((article, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.7)'
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Chip 
                      label={article.source.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: '6px' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {article.timeAgo}
                    </Typography>
                  </Box>
                  
                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    color="inherit"
                  >
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600,
                      lineHeight: 1.3,
                      mb: 1
                    }}>
                      {article.title}
                    </Typography>
                  </Link>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    flex: 1,
                    mb: 2
                  }}>
                    {article.description}
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    endIcon={<OpenInNew fontSize="small" />}
                    component="a"
                    href={article.url}
                    target="_blank"
                    sx={{
                      alignSelf: 'flex-start',
                      borderRadius: '8px',
                      px: 2,
                      py: 1
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
