'use client'

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  Grid,
  Paper,
} from '@mui/material';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import { useRouter } from 'next/navigation'

const Login = () => {
  const router = useRouter()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }
    setLoading(true);    
    
    try {
      const response = await axios.post('http://localhost:4000/graphql', {
        query: `
          mutation {
            login(email: "${email}", password: "${password}")
          }
        `,
      });
      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      localStorage.setItem('token', response.data.data.login.token);

      setOpenSnackbar(true);
      setLoading(false);
      setError(null);

      router.push('/');

    } catch (error) {
      setError(error.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
      <Grid item>
        <Paper elevation={3} style={{ padding: 20 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          <form onSubmit={handleLogin}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading || !email || !password}
              style={{ marginTop: 20 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </form>
          {error && (
            <Alert severity="error" style={{ marginTop: 20 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Typography variant="body1" align="center" style={{ marginTop: 20 }}>
            Don't have an account?{' '}
            <Button color="primary" onClick={() => router.push('/register')}>
              Register
            </Button>
          </Typography>
        </Paper>
      </Grid>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          Logged in successfully!
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default Login;