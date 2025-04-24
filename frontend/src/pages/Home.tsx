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
} from '@mui/material';

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Startup News Feed
      </Typography>

      {news?.articles.map((article: Article, index: number) => (
        <Box key={index} mb={4}>
          <Card sx={{ '&:hover': { boxShadow: 3 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  {article.source.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {article.timeAgo}
                </Typography>
              </Box>
              <Link
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="inherit"
              >
                <Typography variant="h6" gutterBottom>
                  {article.title}
                </Typography>
              </Link>
              <Typography variant="body2" color="text.secondary">
                {article.description}
              </Typography>
            </CardContent>
          </Card>
          {index < news.articles.length - 1 && (
            <Divider sx={{ mt: 4 }} />
          )}
        </Box>
      ))}
    </Container>
  );
}
