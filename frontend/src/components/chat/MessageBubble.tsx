import { motion } from 'framer-motion';
import { Check, CheckCheck, Trash2 } from 'lucide-react';

interface MessageBubbleProps {
  message: any;
  isMe: boolean;
  isFirstInGroup: boolean;
  onDelete: (id: string) => void;
}

export const MessageBubble = ({ message, isMe, isFirstInGroup, onDelete }: MessageBubbleProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${!isFirstInGroup ? 'mt-[-4px]' : 'mt-2'}`}
    >
      <div 
        className={`max-w-[85%] md:max-w-[70%] px-4 py-2 shadow-sm relative group
          ${isMe 
            ? 'bg-[#128C7E] text-white rounded-2xl' 
            : 'bg-white text-slate-800 rounded-2xl border border-slate-100'
          }
          ${isMe && isFirstInGroup ? 'rounded-tr-sm' : ''}
          ${!isMe && isFirstInGroup ? 'rounded-tl-sm' : ''}
        `}
      >
        {/* Hover Actions */}
        <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ${isMe ? '-left-10' : '-right-10'}`}>
          <button 
            onClick={() => onDelete(message.id)}
            className="w-8 h-8 rounded-full bg-white text-rose-500 shadow-md border border-slate-100 flex items-center justify-center hover:bg-rose-50 transition-colors"
            title="Delete message"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Attachment (if any) */}
        {message.attachmentUrl && message.messageType === 'IMAGE' && (
          <div className="mb-2 -mx-2 -mt-1 rounded-t-xl overflow-hidden">
            <img src={message.attachmentUrl} alt="Attachment" className="max-w-full h-auto max-h-64 object-cover" />
          </div>
        )}

        {/* Text */}
        {message.text && (
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{message.text}</p>
        )}

        {/* Timestamp & Read Receipt */}
        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none
          ${isMe ? 'text-white/80' : 'text-slate-400'}`}
        >
          <span className="font-medium">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && (
            message.status === 'READ' ? <CheckCheck size={14} className="text-sky-300" /> 
            : message.status === 'DELIVERED' ? <CheckCheck size={14} className="text-white/80" /> 
            : <Check size={14} />
          )}
        </div>
      </div>
    </motion.div>
  );
};
