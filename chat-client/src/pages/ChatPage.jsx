import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import {
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  makeStyles,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import { baseUrl } from '../lib/utils/endpoints';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { formatDistanceToNow } from 'date-fns';


const useStyles = makeStyles((theme) => ({
  root: {
    height: '97vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    padding: '0px 20px',
    [theme.breakpoints.down('md')]: {
      padding: '0px',
    },
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    marginTop: theme.spacing(4),
    padding: '10px',
    height: '90%',
    maxHeight: '90%',
  },
  messages: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  messageInput: {
    display: 'flex',
    alignItems: 'center',
  },
  textField: {
    flexGrow: 1,
    marginRight: theme.spacing(2),
  },
  sendButton: {
    height: '100%',
  },
  typingIndicator: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  appBar: {
    // marginBottom: theme.spacing(4),
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const socket = io(baseUrl);

function ChatPage() {
  const classes = useStyles();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMessages(JSON.parse(localStorage.getItem('messages')) || []);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      localStorage.setItem('messages', JSON.stringify([...messages, message]));
    });

    socket.on('typing', (data) => {
      setTyping(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    const newMessage = { text: message, timestamp: new Date(), username: localStorage?.getItem('username') };
    socket.emit('sendMessage', newMessage);
    setMessages([...messages, newMessage]);
    setMessage('');
    localStorage.setItem('messages', JSON.stringify([...messages, newMessage]));
  };

  const handleTyping = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    } else {
      socket.emit('typing', `${localStorage.getItem('username')} is typing...`);
      setTimeout(() => socket.emit('typing', ''), 1000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className={classes.root}>
      <AppBar position='static' className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant='h6' className={classes.title}>
            Fake Chat
          </Typography>
          <IconButton edge='end' color='inherit' onClick={handleLogout}>
            <Tooltip title='Logout'>
              <ExitToAppIcon />
            </Tooltip>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Paper className={classes.chatContainer} elevation={3}>
        <List className={classes.messages}>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={
                  <>
                    <strong>{msg.username}:</strong> {msg.text}
                  </>
                }
                secondary={formatDistanceToNow(new Date(msg.timestamp), {
                  addSuffix: true,
                })}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
        <Typography variant='subtitle1' className={classes.typingIndicator}>
          {typing}
        </Typography>
        <div className={classes.messageInput}>
          <TextField
            className={classes.textField}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleTyping}
            variant='outlined'
            placeholder='Type your message...'
            fullWidth
          />
          <Button
            variant='contained'
            color='primary'
            className={classes.sendButton}
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </div>
      </Paper>
    </div>
  );
}

export default ChatPage;
