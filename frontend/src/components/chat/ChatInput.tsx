import { Send, Smile, Paperclip } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface ChatInputProps {
  onSendMessage: (text: string, attachmentUrl?: string, messageType?: string) => void;
  onTyping: () => void;
}

export const ChatInput = ({ onSendMessage, onTyping }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else {
      onTyping();
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setMessage(prev => prev + emojiObject.emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onSendMessage('', base64, 'IMAGE');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-slate-200 flex items-end gap-3 z-20 relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      <button 
        type="button" 
        onClick={() => fileInputRef.current?.click()}
        className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full mb-1"
      >
        <Paperclip size={22} />
      </button>

      <div className="flex-1 bg-slate-100 border border-slate-200 rounded-3xl flex items-end shadow-inner focus-within:ring-2 focus-within:ring-stayzen-main/20 focus-within:border-stayzen-main/30 transition-all relative">
        <button 
          type="button" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-3 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Smile size={24} />
        </button>

        {showEmojiPicker && (
          <div ref={emojiRef} className="absolute bottom-full left-0 mb-2 shadow-2xl z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} />
          </div>
        )}

        <textarea 
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            onTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="w-full bg-transparent border-none py-3.5 px-2 focus:outline-none text-slate-700 resize-none max-h-32 min-h-[52px]"
          rows={1}
        />
      </div>

      <button 
        type="submit" 
        disabled={!message.trim()} 
        className="w-12 h-12 shrink-0 bg-[#128C7E] hover:bg-[#075E54] rounded-full flex items-center justify-center text-white transition-colors shadow-md shadow-[#128C7E]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mb-1"
      >
        <Send size={20} className="ml-1" />
      </button>
    </form>
  );
};
