'use client'

import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Container, Grid, Box, Snackbar, TextField } from '@mui/material';
import { Alert } from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const RESTAURANTS_PER_PAGE = 5;

export default function Home() {
  const router = useRouter()

  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.post('http://localhost:4000/graphql', {
          query: `
            query {
              restaurants(page: ${page}, pageSize: ${RESTAURANTS_PER_PAGE}) {
                id
                name
                address
                email
                phone
              }
            }
          `,
        });
        setRestaurants(response.data.data.restaurants);
      } catch (error) {
        setError('Failed to fetch restaurants');
      }
    };

    fetchRestaurants();
  }, [page]);

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:4000/graphql', {
        query: `
          query {
            searchRestaurants(searchTerm: "${searchTerm}", page: ${page}, pageSize: ${RESTAURANTS_PER_PAGE}) {
              id
              name
              address
              email
              phone
            }
          }
        `,
      });
      setSearchResults(response.data.data.searchRestaurants);
    } catch (error) {
      setError('Failed to search restaurants');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.post(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
        query: `
          mutation {
            deleteRestaurant(id: "${id}")
          }
        `,
      });

      if (response.data.data.deleteRestaurant) {
        setRestaurants((prev) => prev.filter((restaurant) => restaurant.id !== id));
        setAlertMessage('Restaurant deleted successfully');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setError('Failed to delete restaurant');
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');

    router.push('/login')
  };

  return (
    <Container>
      <Box mt={4} mb={2}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Typography variant="h4" color="primary">Restaurants</Typography>
          <Button variant="contained" color="secondary" onClick={handleSignOut}>Sign Out</Button>
        </Grid>
      </Box>
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>Search</Button>
      </Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      )}
      <Box textAlign="center" mb={4}>
        <Link href="/create-restaurant" passHref>
          <Button variant="contained" color="primary">Add Restaurant</Button>
        </Link>
      </Box>
      <Grid container spacing={3}>
        {(searchResults.length > 0 ? searchResults : restaurants).map((restaurant) => (
          <Grid item key={restaurant.id} xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {restaurant.name}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Address: {restaurant.address}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Email: {restaurant.email}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Phone: {restaurant.phone}
                </Typography>
                  <Box display="flex" justifyContent="flex-end" pt={2}>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(restaurant.id);
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box my={4} textAlign="center">
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setPage(page - 1)} 
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setPage(page + 1)} 
            disabled={searchResults.length > 0 ? searchResults.length < RESTAURANTS_PER_PAGE : restaurants.length < RESTAURANTS_PER_PAGE}
          >
            Next
          </Button>
        </Box>
      </Box>

      <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}