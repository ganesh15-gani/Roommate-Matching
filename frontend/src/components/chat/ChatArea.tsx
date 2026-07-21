import { ArrowLeft, Phone, Video, MoreVertical, Smile, CheckCheck } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';

interface ChatAreaProps {
  activeConversation: any;
  messages: any[];
  currentUser: any;
  onBack: () => void;
  onDeleteMessage: (id: string) => void;
  isMobileChatOpen: boolean;
  onlineUsers: Set<string>;
}

export const ChatArea = ({ activeConversation, messages, currentUser, onBack, onDeleteMessage, isMobileChatOpen, onlineUsers }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeConversation) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50 z-10 text-center px-4">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-6 border border-slate-100">
          <Phone size={40} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">StayZen Web</h2>
        <p className="text-slate-500 font-medium max-w-sm">Select a contact from the sidebar to start a real-time conversation.</p>
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest bg-slate-200/50 px-4 py-2 rounded-full">
          <CheckCheck size={16} /> End-to-end encrypted
        </div>
      </div>
    );
  }

  const otherUser = activeConversation.user1Id === currentUser?.id ? activeConversation.user2 : activeConversation.user1;
  const name = `${otherUser?.profile?.firstName || 'Unknown'} ${otherUser?.profile?.lastName || ''}`;
  const isOnline = onlineUsers.has(otherUser?.id);

  return (
    <div className={`${!isMobileChatOpen ? 'hidden md:flex' : 'flex'} flex-1 flex-col relative bg-[#f0f2f5]`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="md:hidden text-slate-500 hover:text-slate-700">
            <ArrowLeft size={24} />
          </button>
          <div className="relative">
            {otherUser?.profile?.photoUrl ? (
              <img src={otherUser.profile.photoUrl} alt={name} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-stayzen-gradient flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg leading-tight">{name}</h3>
            {isOnline ? (
              <p className="text-xs font-bold text-emerald-500 tracking-wide">Online</p>
            ) : (
              <p className="text-xs font-bold text-slate-400 tracking-wide">Offline</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 text-slate-400">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-600"><Phone size={20} /></button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-600"><Video size={20} /></button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-600"><MoreVertical size={20} /></button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3 z-10">
        <div className="text-center mb-6 mt-2 flex justify-center">
          <span className="text-[10px] bg-amber-100/80 text-amber-800 px-4 py-1.5 rounded-lg font-bold tracking-wide uppercase shadow-sm backdrop-blur-sm">
            🔒 End-to-end encrypted
          </span>
        </div>
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 opacity-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <Smile size={40} className="text-stayzen-main" />
            </div>
            <p className="text-slate-500 font-bold">Say hi to {name.split(' ')[0]}!</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.senderId === currentUser?.id;
          const prevMsg = index > 0 ? messages[index - 1] : null;
          const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;

          return (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isMe={isMe} 
              isFirstInGroup={isFirstInGroup}
              onDelete={onDeleteMessage}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
