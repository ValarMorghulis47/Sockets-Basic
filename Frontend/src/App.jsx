import { useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';
import { Box, Container, Stack, TextField, Typography, Tab, Tabs, Paper, Button } from "@mui/material";

function App() {
  const [privateMessage, setPrivateMessage] = useState('');
  const [privateMessages, setPrivateMessages] = useState([]);
  const [groupToSend, setGroupToSend] = useState('');
  const [groupToJoin, setGroupToJoin] = useState('');
  const [groupMessages, setGroupMessages] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [group, setGroup] = useState('');
  const [messages, setMessages] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const socket = useMemo(() => io('http://localhost:3000'), []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePrivateSubmit = () => {
    socket.emit('private-message', { message: privateMessage, recipient });
    setPrivateMessage('');
    setRecipient('');
  };

  const handleGroupSubmit = () => {
    if (groupToSend) {
      socket.emit('group-message', { message: messages, group: groupToSend });
      setMessages('');
      setGroupToSend('');
    } else {
      alert('Please enter a group name first');
    }
  };

  const handleCreateGroup = () => {
    socket.emit('create-group', { group });
    setGroup('');
  };

  const handleJoinGroup = () => {
    socket.emit('join-group', { group: groupToJoin });
    setGroupToJoin('');
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
        if (data.type === 'private') {
          setPrivateMessages((messages) => [...messages, data]);
        } else if (data.type === 'group') {
          setGroupMessages((messages) => [...messages, data]);
        }
    };

    socket.on('connect', () => {
      console.log('Connected to server with id: ', socket.id);
    });

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <Container>
      <Typography variant="h4">Socket.io</Typography>
      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Private Chat" />
          <Tab label="Group Messages" />
        </Tabs>
      </Paper>
      {tabValue === 0 && (
        <Stack spacing={2}>
          <TextField label="Recipient" variant="outlined" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
          <TextField label="Message" variant="outlined" value={privateMessage} onChange={(e) => setPrivateMessage(e.target.value)} />
          <Button onClick={handlePrivateSubmit}>Send</Button>
          {privateMessages.map((msg, index) => (
            <Typography key={index}>{msg.sender}: {msg.message}</Typography>
          ))}
        </Stack>
      )}
      {tabValue === 1 && (
        <Stack spacing={2}>
          <TextField label="Group Name" variant="outlined" value={group} onChange={(e) => setGroup(e.target.value)} />
          <Button onClick={handleCreateGroup}>Create Group</Button>
          <TextField label="Join Group" variant="outlined" value={groupToJoin} onChange={(e) => setGroupToJoin(e.target.value)} />
          <Button onClick={handleJoinGroup}>Join Group</Button>
          <TextField label="Group to Send" variant="outlined" value={groupToSend} onChange={(e) => setGroupToSend(e.target.value)} />
          <TextField label="Message" variant="outlined" value={messages} onChange={(e) => setMessages(e.target.value)} />
          <Button onClick={handleGroupSubmit}>Send</Button>
          {groupMessages.map((msg, index) => (
            <Typography key={index}>{msg.sender}: {msg.message}</Typography>
          ))}
        </Stack>
      )}
    </Container>
  );
}

export default App;