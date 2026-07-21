import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Heart, Check, Clock, User as UserIcon, MapPin, Edit2, Trash2, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreatePostModal } from '../components/roommate/CreatePostModal';
import { Footer } from '../components/layout/Footer';
import { API_URL } from '../config/api';

export const Browse = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Browse');
  
  // Data States
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  
  const navigate = useNavigate();
  
  const postImages = [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1de2d96674?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800"
  ];
  
  const [loading, setLoading] = useState(true);

  const tabs = ['Browse', 'Your Posts', 'Sent Requests', 'Received', 'Friends'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'Browse') {
        // swipe UI is removed
      } else if (activeTab === 'Your Posts') {
        const res = await fetch(`${API_URL}/api/posts/me`);
        setMyPosts(await res.json());
      } else if (activeTab === 'Sent Requests') {
        const res = await fetch(`${API_URL}/api/requests/sent`);
        setSentRequests(await res.json());
      } else if (activeTab === 'Received') {
        const res = await fetch(`${API_URL}/api/requests/received`);
        setReceivedRequests(await res.json());
      } else if (activeTab === 'Friends') {
        const res = await fetch(`${API_URL}/api/friends`);
        setFriends(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  const handleAcceptRequest = async (requestId: string) => {
    try {
      await fetch(`${API_URL}/api/requests/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      fetchData(); // Refresh the list
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async (receiverId: string) => {
    try {
      // Auto-create or get conversation
      const res = await fetch(`${API_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId })
      });
      const conv = await res.json();
      
      // Navigate to chat and open it
      navigate('/chat', { state: { activeConversationId: conv.id } });
    } catch (error) {
      console.error(error);
      navigate('/chat');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      <div className="container mx-auto px-4 md:px-8 py-6 flex-1 flex flex-col items-center relative z-10">
        
        {/* Top Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-5xl rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between text-white shadow-xl gap-6 overflow-hidden relative border border-white/20"
        >
          {/* Colorful Green Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1604871000636-074fa5117945?q=100&w=3000&auto=format&fit=crop")' }}
          ></div>
          
          {/* Glassmorphism Overlay */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-teal-900/80 to-black/50 backdrop-blur-[2px]"></div>

          <div className="flex-1 min-w-0 pr-4 relative z-10">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-4xl font-black mb-2 truncate drop-shadow-lg tracking-tight"
            >
              Residency Network
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-sm md:text-base max-w-md font-medium drop-shadow-md"
            >
              Connect with verified residents in your building or area.
            </motion.p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-6 py-4 bg-white/10 hover:bg-stayzen-main backdrop-blur-md border border-white/40 hover:border-stayzen-main text-white rounded-2xl font-black text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(45,122,113,0.4)] transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 relative z-10"
          >
            <span className="text-xl leading-none">+</span> Find a Roommate
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <div className="w-full max-w-5xl mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-stayzen-main outline-none text-sm text-slate-700"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full max-w-5xl mt-6">
          <div className="bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm inline-flex overflow-x-auto max-w-full custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === tab 
                    ? 'bg-stayzen-main text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full max-w-5xl mt-6 mb-12 flex-1">
          {loading ? (
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center min-h-[400px]">
              <p className="text-slate-500 font-medium animate-pulse">Loading {activeTab}...</p>
            </div>
          ) : activeTab === 'Browse' ? (
            <EmptyState message="Swipe cards have been removed." />
          ) : activeTab === 'Your Posts' ? (
            myPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPosts.map((post, idx) => (
                  <div key={post.id} className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                    {/* Cover Image */}
                    <div className="relative h-48 bg-slate-100">
                      <img src={post.coverImage || postImages[idx % postImages.length]} alt="Room" className="w-full h-full object-cover" />
                      
                      {/* Top Left Icons */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <button 
                          onClick={() => { setPostToEdit(post); setIsModalOpen(true); }}
                          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm hover:scale-105 transition-transform"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-sm hover:scale-105 hover:bg-rose-50 transition-all"
                          title="Delete Post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Top Right Heart */}
                      <div className="absolute top-3 right-3">
                        <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
                          <Heart size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col gap-2">
                      {/* Title & Rating */}
                      <div className="flex justify-between items-center">
                        <h3 className="font-black text-xl text-stayzen-dark uppercase tracking-tight">{post.posterName || 'Anonymous'}</h3>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-amber-500 text-amber-500" />
                          <span className="text-sm font-bold text-slate-700">4.8</span>
                        </div>
                      </div>

                      {/* Location & Status */}
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                          <MapPin size={12} />
                          {post.location || (idx % 2 === 0 ? "HSR Layout, Bangalore" : "Koramangala, Bangalore")}
                        </div>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[9px] font-black tracking-widest uppercase">
                          SOLD OUT
                        </span>
                      </div>

                      {/* Details */}
                      <p className="text-xs font-medium text-slate-600 mt-1">
                        {post.sharingType || "2x Sharing"} • Male @ {post.propertyName || "StayZen"}
                      </p>

                      <hr className="border-slate-100 my-2" />

                      {/* Footer */}
                      <div className="flex justify-between items-center">
                        <span className="font-black text-stayzen-dark text-lg">Price on Request</span>
                        <button onClick={() => handleConnect(post.userId)} className="px-5 py-2 bg-[#2d7a71] text-white font-bold rounded-lg text-sm shadow-md hover:opacity-90 transition-opacity cursor-pointer">
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="You haven't broadcasted any requests yet." />
          ) : activeTab === 'Sent Requests' ? (
            sentRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sentRequests.map(req => (
                  <div key={req.id} className="bg-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center font-black text-2xl text-slate-300 border border-slate-100">
                        {req.receiver.profile.firstName[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">{req.receiver.profile.firstName} {req.receiver.profile.lastName}</h4>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><Clock size={12}/> Pending Approval</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 w-max">{req.status}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="You haven't sent any requests." />
          ) : activeTab === 'Received' ? (
            receivedRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {receivedRequests.map(req => (
                  <div key={req.id} className="bg-white p-5 rounded-2xl flex flex-col gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-stayzen-gradient flex items-center justify-center font-black text-2xl text-white shadow-inner">
                        {req.sender.profile.firstName[0]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-lg">{req.sender.profile.firstName} {req.sender.profile.lastName}</h4>
                        <p className="text-xs text-slate-500 font-medium">{req.sender.profile.occupation}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button className="flex-1 py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 text-slate-600 font-bold hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-colors text-sm">
                        <X size={16} /> Decline
                      </button>
                      <button onClick={() => handleAcceptRequest(req.id)} className="flex-1 py-2.5 rounded-xl bg-stayzen-main flex items-center justify-center gap-2 text-white font-bold hover:opacity-90 transition-opacity shadow-md shadow-stayzen-main/20 text-sm">
                        <Check size={16} /> Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="No pending received requests." />
          ) : activeTab === 'Friends' ? (
            friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map(f => (
                  <div key={f.id} className="bg-white p-6 rounded-3xl flex flex-col items-center text-center gap-4 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-stayzen-gradient flex items-center justify-center font-black text-4xl text-white shadow-xl shadow-stayzen-main/20">
                        {f.user2.profile.firstName[0]}
                      </div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-sm"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xl">{f.user2.profile.firstName} {f.user2.profile.lastName}</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">{f.user2.profile.occupation}</p>
                    </div>
                    <a href="/chat" className="w-full py-3 mt-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-stayzen-main hover:bg-stayzen-main hover:text-white hover:border-stayzen-main transition-all flex items-center justify-center gap-2">
                      <UserIcon size={16} /> Start Chatting
                    </a>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="You haven't matched with anyone yet." />
          ) : null}
        </div>

      </div>

      <Footer />
      
      <CreatePostModal 
        isOpen={isModalOpen} 
        editPost={postToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setPostToEdit(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setPostToEdit(null);
          setActiveTab('Your Posts');
          fetchData();
        }}
      />
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center min-h-[400px]">
    <div className="relative mb-6">
      <UserIcon size={48} className="text-stayzen-dark opacity-20" />
    </div>
    <h3 className="text-xl font-bold text-stayzen-dark mb-2">{message}</h3>
  </div>
);
