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
  imageUrl?: string;
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
        const response = await fetch('/api/v1/startup-news?page=1&page_size=6');
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
          backdropFilter: 'blur(16px)',
          background: theme.palette.mode === 'dark'
            ? 'rgba(32, 10, 10, 0.7)'
            : 'rgba(255, 235, 235, 0.7)'
        }}>
          {error}
        </Alert>
      ) : news?.articles ? (
        <Grid container spacing={4}>
          {news.articles.map((article, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[10]
                },
                backdropFilter: 'blur(16px)',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(30, 30, 30, 0.7)'
                  : 'rgba(255, 255, 255, 0.7)',
                border: theme.palette.mode === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}>
                <Box 
                  sx={{
                    height: 160,
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(50,50,50,0.5)' 
                      : 'rgba(240,240,240,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover img': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <img
                    src={article.imageUrl || `https://source.unsplash.com/random/600x400/?startup,tech,${index}`}
                    alt={article.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      display: article.imageUrl ? 'block' : 'none'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Box sx={{ 
                    width: 60, 
                    height: 60,
                    color: theme.palette.text.secondary,
                    display: article.imageUrl ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    {article.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Chip 
                      label={article.source.name} 
                      size="small" 
                      sx={{ 
                        mr: 1,
                        fontWeight: 500,
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {article.timeAgo}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener"
                    size="small"
                    endIcon={<OpenInNew />}
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        color: theme.palette.primary.dark
                      }
                    }}
                  >
                    Read Article
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}
    </Container>
  );
}
