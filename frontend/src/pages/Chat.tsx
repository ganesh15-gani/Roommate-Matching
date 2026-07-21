import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatArea } from '../components/chat/ChatArea';
import { ChatInput } from '../components/chat/ChatInput';

export const Chat = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const activeConversationRef = useRef(activeConversation);
  
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user
  useEffect(() => {
    fetch('http://localhost:5000/api/me')
      .then(res => res.json())
      .then(data => {
         if (data) setCurrentUser(data);
      })
      .catch(console.error);
  }, []);

  // Fetch Conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/chat/conversations');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!currentUser
  });

  // Auto-open conversation from Router State
  useEffect(() => {
    if (conversations.length > 0 && location.state?.activeConversationId && !activeConversation) {
      const targetConv = conversations.find((c: any) => c.id === location.state.activeConversationId);
      if (targetConv) {
        setActiveConversation(targetConv);
        setIsMobileChatOpen(true);
      }
    }
  }, [conversations, location.state, activeConversation]);

  // Fetch Messages for active chat
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', activeConversation?.id],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/api/chat/messages/${activeConversation.id}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!activeConversation
  });

  // Setup Socket
  useEffect(() => {
    if (!currentUser) return;
    
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('setup', currentUser.id);
    });

    newSocket.on('user_online', (userId: string) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.add(userId);
        return next;
      });
    });

    newSocket.on('user_offline', (userId: string) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    newSocket.on('receive_message', (msg: any) => {
      // Optimistically add to active chat if open
      queryClient.setQueryData(['messages', msg.conversationId], (old: any) => {
        if (!old) return [msg];
        if (old.find((m: any) => m.id === msg.id)) return old;
        return [...old, msg];
      });
      // Invalidate conversations to update latest message in sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      // Send read receipt if we are actively viewing this chat
      if (activeConversationRef.current?.id === msg.conversationId && msg.senderId !== currentUser.id) {
        newSocket.emit('message_read', { messageId: msg.id, conversationId: msg.conversationId });
      }
    });

    newSocket.on('message_status_update', ({ messageId, status }: any) => {
      queryClient.setQueryData(['messages', activeConversationRef.current?.id], (old: any) => {
        if (!old) return old;
        return old.map((m: any) => m.id === messageId ? { ...m, status } : m);
      });
    });

    return () => {
      newSocket.close();
    };
  }, [currentUser, queryClient]);

  // Join active chat room
  useEffect(() => {
    if (socket && activeConversation) {
      socket.emit('join_chat', activeConversation.id);
      
      // Mark all unread messages as read
      messages.forEach((msg: any) => {
        if (msg.senderId !== currentUser?.id && msg.status !== 'READ') {
          socket.emit('message_read', { messageId: msg.id, conversationId: activeConversation.id });
        }
      });
    }
  }, [socket, activeConversation, messages, currentUser]);

  const handleSendMessage = (text: string, attachmentUrl?: string, messageType?: string) => {
    if (!socket || !activeConversation || !currentUser) return;

    const otherUser = activeConversation.user1Id === currentUser.id ? activeConversation.user2 : activeConversation.user1;
    
    socket.emit('send_message', {
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      text,
      attachmentUrl,
      messageType
    });
  };

  const handleTyping = useCallback(() => {
    if (!socket || !activeConversation || !currentUser) return;
    const otherUser = activeConversation.user1Id === currentUser.id ? activeConversation.user2 : activeConversation.user1;
    socket.emit('typing', { conversationId: activeConversation.id, senderId: currentUser.id, receiverId: otherUser.id });
  }, [socket, activeConversation, currentUser]);

  const handleDeleteMessage = (id: string) => {
    // We would normally call API here, but for UI sake let's just remove it optimistically
    queryClient.setQueryData(['messages', activeConversation?.id], (old: any) => {
      if (!old) return old;
      return old.filter((m: any) => m.id !== id);
    });
  };

  if (isLoading) {
    return <div className="h-screen pt-16 flex items-center justify-center bg-slate-100"><div className="animate-pulse text-stayzen-main font-bold">Loading secure chats...</div></div>;
  }

  return (
    <div className="h-screen bg-slate-100 pt-16 flex flex-col overflow-hidden">
      <div className="flex-1 w-full max-w-7xl mx-auto md:p-4 h-full flex">
        <div className="flex w-full h-full bg-white md:rounded-3xl md:shadow-xl md:border border-slate-200 overflow-hidden relative">
          
          <ChatSidebar 
            conversations={conversations} 
            activeConversation={activeConversation}
            onSelectConversation={(conv) => {
              setActiveConversation(conv);
              setIsMobileChatOpen(true);
            }}
            isMobileChatOpen={isMobileChatOpen}
            currentUser={currentUser}
            onlineUsers={onlineUsers}
          />

          <div className="flex-1 flex flex-col h-full w-full absolute md:relative inset-0 bg-white">
            <ChatArea 
              activeConversation={activeConversation}
              messages={messages}
              currentUser={currentUser}
              onBack={() => setIsMobileChatOpen(false)}
              onDeleteMessage={handleDeleteMessage}
              isMobileChatOpen={isMobileChatOpen}
              onlineUsers={onlineUsers}
            />
            
            {activeConversation && (
              <ChatInput 
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
