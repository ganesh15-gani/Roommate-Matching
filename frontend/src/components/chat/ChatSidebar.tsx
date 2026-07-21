import { Search, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface ChatSidebarProps {
  conversations: any[];
  activeConversation: any | null;
  onSelectConversation: (conv: any) => void;
  isMobileChatOpen: boolean;
  currentUser: any;
  onlineUsers: Set<string>;
}

export const ChatSidebar = ({ conversations, activeConversation, onSelectConversation, isMobileChatOpen, currentUser, onlineUsers }: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getOtherUser = (conv: any) => {
    return conv.user1Id === currentUser?.id ? conv.user2 : conv.user1;
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherUser(conv);
    const fullName = `${other?.profile?.firstName || ''} ${other?.profile?.lastName || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className={`${isMobileChatOpen ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] flex-col border-r border-slate-100 bg-white z-10 shrink-0`}>
      {/* Sidebar Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Chats</h2>
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b border-slate-100 bg-white">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stayzen-main/20 focus:bg-white transition-all text-slate-700 font-medium"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium text-sm">
            You haven't started any conversations yet.<br/><br/>
            <a href="/browse" className="text-stayzen-main hover:underline font-bold">Go to Browse</a> to connect!
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium text-sm">
            No friends match your search "{searchQuery}".
          </div>
        ) : filteredConversations.map(conv => {
          const other = getOtherUser(conv);
          const name = `${other?.profile?.firstName || 'Unknown'} ${other?.profile?.lastName || ''}`;
          const isOnline = onlineUsers.has(other?.id);
          const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;

          return (
            <div 
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-slate-50 ${activeConversation?.id === conv.id ? 'bg-stayzen-main/5' : 'hover:bg-slate-50'}`}
            >
              <div className="relative">
                {other?.profile?.photoUrl ? (
                  <img src={other.profile.photoUrl} alt={name} className="w-14 h-14 rounded-full object-cover shadow-sm border border-slate-100" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-stayzen-gradient flex items-center justify-center text-white font-black text-2xl shadow-sm">
                    {name.charAt(0)}
                  </div>
                )}
                {isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-slate-900 truncate text-base">{name}</h3>
                  <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-2">
                    {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className={`text-sm truncate font-medium ${activeConversation?.id === conv.id ? 'text-stayzen-main' : 'text-slate-500'}`}>
                  {lastMsg ? (lastMsg.senderId === currentUser?.id ? `You: ${lastMsg.text || 'Attachment'}` : lastMsg.text || 'Attachment') : 'No messages yet'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};
