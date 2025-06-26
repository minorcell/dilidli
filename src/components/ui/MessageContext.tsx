import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface MessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface MessageState extends MessageProps {
  id: string;
  isVisible: boolean;
}

interface MessageContextType {
  messages: MessageState[];
  showMessage: (props: MessageProps) => string;
  hideMessage: (id: string) => void;
  clearMessages: () => void;
  success: (msg: string, title?: string, duration?: number) => string;
  error: (msg: string, title?: string, duration?: number) => string;
  warning: (msg: string, title?: string, duration?: number) => string;
  info: (msg: string, title?: string, duration?: number) => string;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<MessageState[]>([]);

  const showMessage = useCallback((props: MessageProps): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newMessage: MessageState = {
      ...props,
      id,
      isVisible: true,
      duration: props.duration || 4000
    };

    setMessages(prev => [...prev, newMessage]);

    // 自动关闭
    if (newMessage.duration && newMessage.duration > 0) {
      setTimeout(() => {
        hideMessage(id);
      }, newMessage.duration);
    }

    return id;
  }, []);

  const hideMessage = useCallback((id: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, isVisible: false } : msg
      )
    );
    
    // 动画结束后移除
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }, 300);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const success = useCallback((msg: string, title?: string, duration?: number) => 
    showMessage({ type: 'success', message: msg, title, duration }), [showMessage]);
  
  const error = useCallback((msg: string, title?: string, duration?: number) => 
    showMessage({ type: 'error', message: msg, title, duration }), [showMessage]);
  
  const warning = useCallback((msg: string, title?: string, duration?: number) => 
    showMessage({ type: 'warning', message: msg, title, duration }), [showMessage]);
  
  const info = useCallback((msg: string, title?: string, duration?: number) => 
    showMessage({ type: 'info', message: msg, title, duration }), [showMessage]);

  const contextValue: MessageContextType = {
    messages,
    showMessage,
    hideMessage,
    clearMessages,
    success,
    error,
    warning,
    info
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
      <MessageContainer />
    </MessageContext.Provider>
  );
};

// 单个消息组件
function MessageItem({ message: msg, onClose }: { message: MessageState; onClose: (id: string) => void }) {
  const getIcon = () => {
    switch (msg.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getColors = () => {
    switch (msg.type) {
      case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className={`
      flex items-start p-4 border-2 rounded-xl shadow-lg backdrop-blur-sm
      transform transition-all duration-300 ease-out
      ${msg.isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-2 opacity-0 scale-95'}
      ${getColors()}
    `}>
      <div className="text-2xl mr-3 flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        {msg.title && (
          <h4 className="font-semibold text-lg mb-1">{msg.title}</h4>
        )}
        <p className="text-sm leading-relaxed">{msg.message}</p>
      </div>
      <button
        onClick={() => onClose(msg.id)}
        className="ml-3 flex-shrink-0 text-lg opacity-50 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}

// 消息容器组件
function MessageContainer() {
  const { messages, hideMessage } = useMessage();

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-3 max-w-md w-full pointer-events-none">
      {messages.map((msg) => (
        <div key={msg.id} className="pointer-events-auto">
          <MessageItem 
            message={msg} 
            onClose={hideMessage} 
          />
        </div>
      ))}
    </div>
  );
} 