import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, Clock, MessageSquare, Send, Heart, LogOut, Menu, X, Trash2, ChevronLeft, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { PostCard } from '../components/PostCard';
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('browse');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Chat states
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (user) {
      const delayDebounceFn = setTimeout(() => {
        fetchDashboardData();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, searchQuery]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [postsRes, myPostsRes, requestsRes, connectionsRes, favoritesRes] = await Promise.all([
        api.get(`/posts?city=${searchQuery}`),
        api.get('/posts/mine'),
        api.get('/connections/requests'),
        api.get('/connections'),
        api.get('/users/favorites')
      ]);
      setPosts(postsRes.data);
      setMyPosts(myPostsRes.data);
      setReceivedRequests(requestsRes.data.received);
      setSentRequests(requestsRes.data.sent);
      setConnections(connectionsRes.data);
      setFavorites(favoritesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (postId: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        await api.delete(`/users/favorites/${postId}`);
        setFavorites(prev => prev.filter(f => f.id !== postId));
      } else {
        await api.post('/users/favorites', { postId });
        const favPost = posts.find(p => p.id === postId);
        if (favPost) setFavorites(prev => [...prev, favPost]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (friendId: string) => {
    try {
      const res = await api.get(`/messages/${friendId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;
    try {
      await api.post('/messages', {
        receiverId: selectedFriend.id,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedFriend.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  useEffect(() => {
    let interval: any;
    if (activeTab === 'chat' && selectedFriend) {
      fetchMessages(selectedFriend.id);
      interval = setInterval(() => fetchMessages(selectedFriend.id), 3000);
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedFriend]);

  const handleSendRequest = async (receiverId: string) => {
    try {
      await api.post('/connections/request', { receiverId });
      toast.success('Connection request sent successfully!');
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleRespondRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.post('/connections/respond', { requestId, status });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await api.post('/connections/cancel', { requestId });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/posts/${postId}`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('browse')}>
            <span className="text-[#003366] font-bold text-3xl leading-none tracking-tight flex items-center">
              <span className="text-[#10b981] mr-1">S</span>tayZen
            </span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-6">
            <button className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer">Explore</button>
            <button className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer">Blogs</button>
            <button className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer">Bookings</button>
            <button className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer">Payments</button>
            <button onClick={() => setActiveTab('favorites')} className={`font-medium text-sm transition-colors cursor-pointer ${activeTab === 'favorites' ? 'bg-[#00707c] text-white px-4 py-2 rounded-full' : 'text-slate-500 hover:text-slate-900'}`}>Favorites</button>
            <button onClick={() => setActiveTab('chat')} className={`font-medium text-sm transition-colors cursor-pointer ${activeTab === 'chat' ? 'bg-[#00707c] text-white px-4 py-2 rounded-full' : 'text-slate-500 hover:text-slate-900'}`}>Messages</button>
            <button onClick={() => setActiveTab('browse')} className={`font-medium text-sm transition-colors cursor-pointer ${activeTab === 'browse' || activeTab === 'connections' ? 'bg-[#00707c] text-white px-4 py-2 rounded-full' : 'text-slate-500 hover:text-slate-900'}`}>Roommates</button>
            <button className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer">Profile</button>
            <button className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer">Help Center</button>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block bg-[#00707c] hover:bg-[#005a63] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-sm">
              Enroll Property
            </button>
            
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`p-2.5 rounded-full transition-colors cursor-pointer flex items-center justify-center ${activeTab === 'favorites' ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400 hover:text-slate-700'}`}
              title="Favorites"
            >
              <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            
            {/* Desktop Profile Dropdown */}
            <div className="hidden lg:block relative group">
              <button className="w-10 h-10 rounded-full bg-green-50 border border-green-200 text-green-700 flex items-center justify-center font-bold shadow-sm cursor-pointer hover:bg-green-100 transition-colors">
                {user.fullName.charAt(0).toUpperCase()}
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                <button 
                  onClick={logout} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="lg:hidden border-t border-slate-100 bg-white overflow-hidden"
            >
              <div className="p-4 space-y-4 flex flex-col">
                <button onClick={() => { setActiveTab('browse'); setIsMobileMenuOpen(false); }} className="text-left font-medium text-slate-700">Roommates</button>
                <button onClick={() => { setActiveTab('favorites'); setIsMobileMenuOpen(false); }} className="text-left font-medium text-slate-700">Favorites</button>
                <button onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }} className="text-left font-medium text-slate-700">Messages</button>
                <hr className="border-slate-100" />
                <button onClick={logout} className="text-left font-medium text-red-600 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Residency Network Hero Banner */}
        <div className="w-full bg-gradient-to-r from-[#003366] to-[#45a29e] rounded-[1.5rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">StayZen Classifieds</h1>
            <p className="text-white/80 text-lg md:text-xl font-medium">Post your requirements or find your perfect roommate instantly.</p>
          </div>
          <button onClick={() => navigate('/create-post')} className="mt-6 md:mt-0 relative z-10 bg-white text-[#00707c] hover:bg-slate-50 px-6 py-3.5 rounded-full font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer border border-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Create a Listing
          </button>
        </div>

        {/* Global Search */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-8 flex items-center px-4">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..." 
            className="w-full py-3 bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>

        {/* Sub-Tabs for Roommates */}
        {(activeTab === 'browse' || activeTab === 'my_posts' || activeTab === 'sent_requests' || activeTab === 'received' || activeTab === 'friends' || activeTab === 'chat') && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-fit mb-8 whitespace-nowrap items-center">
            <button onClick={() => setActiveTab('browse')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${activeTab === 'browse' ? 'bg-[#004d40] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Browse</button>
            <button onClick={() => setActiveTab('my_posts')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${activeTab === 'my_posts' ? 'bg-[#004d40] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Your Posts</button>
            <button onClick={() => setActiveTab('sent_requests')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${activeTab === 'sent_requests' ? 'bg-[#004d40] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Sent Requests</button>
            <button onClick={() => setActiveTab('received')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${activeTab === 'received' ? 'bg-[#004d40] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              Received {receivedRequests.length > 0 && <span className={`text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${activeTab === 'received' ? 'bg-white text-[#004d40]' : 'bg-slate-100 text-slate-600'}`}>{receivedRequests.length}</span>}
            </button>
            <button onClick={() => setActiveTab('friends')} className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${activeTab === 'friends' ? 'bg-[#004d40] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              Friends {connections.length > 0 && <span className={`text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${activeTab === 'friends' ? 'bg-white text-[#004d40]' : 'bg-slate-100 text-slate-600'}`}>{connections.length}</span>}
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'browse' && (
            <motion.div key="browse" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
               {loading ? (
                 <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div></div>
               ) : posts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                   <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <Search className="w-10 h-10 text-slate-400" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">No listings found</h3>
                   <p className="text-slate-500">Try searching another location or check back later.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {posts.map(p => {
                     const isFavorited = favorites.some(f => f.id === p.id);
                     const isRequested = sentRequests.some(req => req.receiver?.id === p.author.id);
                     const isConnected = connections.some(conn => conn.id === p.author.id);
                     return (
                       <PostCard 
                         key={p.id}
                         post={p}
                         variant="public"
                         isFavorited={isFavorited}
                         isRequested={isRequested}
                         isConnected={isConnected}
                         onToggleFavorite={handleToggleFavorite}
                         onSendRequest={handleSendRequest}
                       />
                     );
                   })}
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === 'my_posts' && (
            <motion.div key="my_posts" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div></div>
              ) : myPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">You haven't posted yet</h3>
                  <p className="text-slate-500 mb-6">Create a listing to find your perfect roommate.</p>
                  <button onClick={() => navigate('/create-post')} className="bg-[#00707c] hover:bg-[#005a63] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer">
                    Create a Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {myPosts.map(p => (
                    <PostCard 
                      key={p.id}
                      post={p}
                      variant="mine"
                      onDelete={handleDeletePost}
                      onEdit={() => toast('Edit feature coming soon!')}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div key="favorites" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div></div>
              ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                  <Heart className="w-16 h-16 text-slate-200 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No favorites yet</h3>
                  <p className="text-slate-500">Save listings you like to view them later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {favorites.map(p => {
                    const isRequested = sentRequests.some(req => req.receiver?.id === p.author.id);
                    const isConnected = connections.some(conn => conn.id === p.author.id);
                    return (
                      <PostCard 
                        key={p.id}
                        post={p}
                        variant="favorite"
                        isFavorited={true}
                        isRequested={isRequested}
                        isConnected={isConnected}
                        onToggleFavorite={handleToggleFavorite}
                        onSendRequest={handleSendRequest}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'sent_requests' && (
            <motion.div key="sent_requests" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {sentRequests.length === 0 ? (
                <p className="text-slate-500 py-8 text-center bg-white rounded-[2rem] shadow-sm border border-slate-100">You haven't sent any requests.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {sentRequests.map(req => (
                    <div key={req.id} className="bg-white rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#004d40] text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                          {req.receiver.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{req.receiver.fullName}</h4>
                          <p className="text-sm text-slate-500 flex items-center gap-1"><Clock className="w-4 h-4" /> Pending Response</p>
                        </div>
                      </div>
                      <button onClick={() => handleCancelRequest(req.id)} className="px-5 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'received' && (
            <motion.div key="received" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {receivedRequests.length === 0 ? (
                <p className="text-slate-500 py-8 text-center bg-white rounded-[2rem] shadow-sm border border-slate-100">No new requests.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {receivedRequests.map(req => (
                    <div key={req.id} className="bg-white rounded-[1.5rem] p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm border border-slate-100 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#6C63FF] text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                          {req.sender.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{req.sender.fullName}</h4>
                          <p className="text-sm text-slate-500">Wants to chat about Other</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleRespondRequest(req.id, 'REJECTED')} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
                          <X className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRespondRequest(req.id, 'ACCEPTED')} className="px-6 py-2.5 bg-[#004d40] hover:bg-[#003d33] text-white rounded-full transition-colors cursor-pointer font-semibold flex items-center gap-2 text-sm shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div key="friends" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {connections.length === 0 ? (
                <p className="text-slate-500 py-8 text-center bg-white rounded-[2rem] shadow-sm border border-slate-100">No friends yet. Go connect!</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {connections.map(friend => (
                    <div key={friend.id} className="bg-white rounded-[1.5rem] p-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm border border-slate-100 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#10b981] text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                          {friend.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{friend.fullName}</h4>
                          <p className="text-sm text-slate-500">Connected via <span className="text-[#00707c] font-medium">Other</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setSelectedFriend(friend); setActiveTab('chat'); }} className="px-5 py-2.5 bg-[#e0f2f1] text-[#00695c] hover:bg-[#b2dfdb] rounded-xl transition-colors cursor-pointer font-semibold flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4" /> Chat
                        </button>
                        <button className="px-5 py-2.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-xl transition-colors cursor-pointer font-semibold text-sm hidden md:block">
                          Add Chat
                        </button>
                        <button className="px-5 py-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer font-semibold text-sm">
                          Remove Friend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'chat' && selectedFriend && (
            <motion.div key="chat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 h-[75vh] md:h-[650px] flex flex-col overflow-hidden relative">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shadow-sm bg-white z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setSelectedFriend(null); setActiveTab('friends'); }} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 cursor-pointer rounded-full hover:bg-slate-50">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 overflow-hidden">
                    {selectedFriend.profilePhotoUrl ? (
                      <img src={selectedFriend.profilePhotoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{selectedFriend.fullName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight flex items-center gap-2">
                      {selectedFriend.fullName}
                    </h3>
                    <p className="text-xs text-[#10b981] font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Online
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAFBFC]">
                {messages.map(msg => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-6 group`}>
                      <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                          {isMe && (
                            <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 cursor-pointer" title="Delete Message">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div className={`relative px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm flex gap-3 items-end ${isMe ? 'bg-gradient-to-r from-[#006064] to-[#004d40] text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm'}`}>
                            <span className="mb-1">{msg.content}</span>
                            <span className={`text-[10px] font-medium min-w-fit ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full p-1.5 pr-2 focus-within:ring-2 focus-within:ring-[#00707c]/20 focus-within:border-[#00707c] transition-all shadow-sm">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#006064] to-[#004d40] text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-sm">
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
