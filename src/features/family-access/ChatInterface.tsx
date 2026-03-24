import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, Button, Typography, Paper, CircularProgress, IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../../../lib/supabase';
import { FilteredFolio } from './utils/filterFolioByAccess';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  filteredFolio: FilteredFolio;
  ownerId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  filteredFolio, ownerId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Get the current session token explicitly to avoid timing issues with the global fetch override
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Call the Supabase Edge Function proxy (it handles filtering, prompting, and logging server-side)
      const { data, error } = await supabase.functions.invoke('family-chat-proxy', {
        body: {
          question: trimmed,
          owner_id: ownerId,
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data?.answer || 'Sorry, I was unable to process your question. Please try again.',
      };
      setMessages([...updatedMessages, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([
        ...updatedMessages,
        { role: 'assistant', content: 'An error occurred. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', height: 500, borderRadius: 2 }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: '#1a237e' }}>
          Chat with {filteredFolio.ownerName}'s Folio
        </Typography>
        {messages.length > 0 && (
          <IconButton size="small" onClick={() => setMessages([])} title="Clear chat">
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#fafafa' }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
            <Typography variant="body1">
              Ask a question about {filteredFolio.ownerName}'s folio.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              You have access to: {filteredFolio.sectionsIncluded.join(', ')}
            </Typography>
          </Box>
        )}
        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                maxWidth: '75%',
                p: 1.5,
                borderRadius: 2,
                bgcolor: msg.role === 'user' ? '#1a237e' : '#fff',
                color: msg.role === 'user' ? '#fff' : 'text.primary',
                border: msg.role === 'assistant' ? '1px solid #e0e0e0' : 'none',
                whiteSpace: 'pre-wrap',
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
            </Box>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
              <CircularProgress size={20} />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          multiline
          maxRows={3}
        />
        <Button
          variant="contained"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#000051' }, minWidth: 48 }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatInterface;
