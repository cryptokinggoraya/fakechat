import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  Grid,
  makeStyles,
  Link,
  Paper,
} from '@material-ui/core';
import { baseUrl } from '../lib/utils/endpoints';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid green',
  },
  paper: {
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  switchLink: {
    marginTop: theme.spacing(2),
    cursor: 'pointer',
  },
}));

function AuthPage() {
  const classes = useStyles();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${baseUrl}/login`, {
        username,
        password,
      });
      if (response?.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        navigate('/');
      }
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post(`${baseUrl}/register`, {
        username,
        password,
      });
      setIsLogin(true);
      alert('Registration successful! Please login.');
    } catch (error) {
      alert('Registration failed');
    }
  };

  return (
    <Grid container component='main' className={classes.root}>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Typography component='h1' variant='h4'>
            {isLogin ? 'Login' : 'Register'}
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              label='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              label='Password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type='button'
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              onClick={isLogin ? handleLogin : handleRegister}
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link
                  className={classes.switchLink}
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin
                    ? "Don't have an account? Register"
                    : 'Already have an account? Login'}
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}

export default AuthPage;
