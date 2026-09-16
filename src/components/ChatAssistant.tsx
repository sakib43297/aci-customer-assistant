import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, Product } from '../types';
import { ACI_PRODUCTS } from '../data/products';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  ShoppingCart, 
  Check, 
  HelpCircle,
  UserCheck,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  X,
  MessageSquare,
  ExternalLink,
  Eye,
  ArrowRight
} from 'lucide-react';
import { getRepresentativeForBusiness, BUSINESS_REPRESENTATIVES } from '../data/representatives';
import { ProductDetailModal } from './ProductDetailModal';

interface ChatAssistantProps {
  onAddToCart: (product: Product, quantity: number) => void;
  cartItemsCount: Record<string, number>;
  storageScope: string;
  onViewProduct?: (product: Product) => void;
  onNavigateToCatalog?: (product: Product) => void;
}

const BUSINESSES = [
  'ACI Limited (Pharma)',
  'ACI HealthCare Limited',
  'ACI Biotech Limited',
  'ACI Herbal and Nutraceuticals Ltd',
  'ACI Agribusinesses',
  'ACI Agrolink Limited',
  'ACI Motors Limited',
  'ACI Foods Limited',
  'ACI Pure Flour Limited',
  'ACI Salt Limited',
  'ACI Edible Oils Limited',
  'Neem Laboratories (Pvt.) Ltd.',
  'ACI Logistics Limited (Shwapno)',
  'ACI Formulations PLC',
  'ACI Seed Limited'
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
  onAddToCart, 
  cartItemsCount,
  storageScope,
  onViewProduct,
  onNavigateToCatalog
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedProduct, setAddedProduct] = useState<Record<string, boolean>>({});
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  
  // Forward state
  const [selectedMsgForForward, setSelectedMsgForForward] = useState<ChatMessage | null>(null);
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [forwardBusiness, setForwardBusiness] = useState('ACI Limited (Pharma)');
  const [customerName, setCustomerName] = useState('Finaci Merchant Store');
  const [customerContact, setCustomerContact] = useState('+880 1712-345678');
  const [customerNote, setCustomerNote] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [isForwardSuccess, setIsForwardSuccess] = useState(false);
  const [forwardedMsgIds, setForwardedMsgIds] = useState<Record<string, boolean>>({});
  const chatStorageKey = `aci_order_hub_chat_history:${storageScope}`;

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggestion chips in both English & Bangla based on the requested roles
  const suggestionChips = [
    { label: "💊 Stomach pain medicine?", query: "I have stomach pain and need medicine, what do you recommend?" },
    { label: "🔥 Acidity & Gastric relief", query: "I have burning gastric pain and acidity, what ACI medicine should I take?" },
    { label: "🦠 Savlon Liquid vs Cream?", query: "What is the difference between Savlon Liquid and Savlon Cream?" },
    { label: "🌾 Fertilizer for maize?", query: "Which ACI fertilizer works best for maize?" },
    { label: "🦟 Kill mosquitoes at home", query: "I need something to kill mosquitoes at home" },
    { label: "🌾 Seeds for rice season", query: "I need high yield seeds for the next rice season" },
    { label: "🏪 Nearest Shwapno outlet?", query: "Where is the nearest Shwapno retail outlet?" }
  ];

  // Initialize with greeting
  useEffect(() => {
    const savedMessages = localStorage.getItem(chatStorageKey);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(Array.isArray(parsed) ? parsed : []);
        return;
      } catch (error) {
        console.error('Error parsing account chat history', error);
      }
    }

    setMessages([
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: "Welcome to AI Customer Assistant! What are you looking for today — medicines, household products, farming supplies, or grocery items?\n\nস্বাগতম ACI Customer Assistant-এ! আজ আপনি কী খুঁজছেন — ওষুধ, গৃহস্থালি সামগ্রী, খামার সরবরাহ, নাকি মুদি আইটেম?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [chatStorageKey]);

  // Save chat only under the active account or guest session
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    }
  }, [messages, chatStorageKey]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI assistant.');
      }

      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'Sorry, I encountered an issue processing that. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        productIds: data.productIds || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: "I'm sorry, I'm having trouble connecting to the ACI Customer Assistant server. Please make sure your system is online and try again. Alternatively, you can browse products directly in our Product Catalog tab!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      const initialGreeting: ChatMessage[] = [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: "Welcome to AI Customer Assistant! What are you looking for today — medicines, household products, farming supplies, or grocery items?\n\nস্বাগতম ACI Customer Assistant-এ! আজ আপনি কী খুঁজছেন — ওষুধ, গৃহস্থালি সামগ্রী, খামার সরবরাহ, নাকি মুদি আইটেম?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(initialGreeting);
      localStorage.setItem(chatStorageKey, JSON.stringify(initialGreeting));
    }
  };

  const detectBusinessFromMessage = (text: string): string => {
    const mentioned = getMentionedProducts(text);
    if (mentioned.length > 0 && mentioned[0].business) {
      return mentioned[0].business;
    }
    
    // Hardcoded keywords matching
    const textLower = text.toLowerCase();
    if (textLower.includes('savlon') || textLower.includes('liquid') || textLower.includes('cream') || textLower.includes('antiseptic')) {
      return 'ACI Limited (Pharma)';
    }
    if (textLower.includes('medicine') || textLower.includes('paracetamol') || textLower.includes('amox') || textLower.includes('atorva') || textLower.includes('tablet') || textLower.includes('capsule')) {
      return 'ACI Limited (Pharma)';
    }
    if (textLower.includes('fertilizer') || textLower.includes('seed') || textLower.includes('maize') || textLower.includes('rice') || textLower.includes('crop') || textLower.includes('pesticide') || textLower.includes('agri') || textLower.includes('combine') || textLower.includes('harvester') || textLower.includes('tractor') || textLower.includes('maize-mix')) {
      return 'ACI Agribusinesses';
    }
    if (textLower.includes('salt') || textLower.includes('pure salt')) {
      return 'ACI Salt Limited';
    }
    if (textLower.includes('flour') || textLower.includes('atta') || textLower.includes('maida') || textLower.includes('suji')) {
      return 'ACI Pure Flour Limited';
    }
    if (textLower.includes('oil') || textLower.includes('soyabean')) {
      return 'ACI Edible Oils Limited';
    }
    if (textLower.includes('shwapno') || textLower.includes('grocery') || textLower.includes('outlet') || textLower.includes('sagor') || textLower.includes('banana')) {
      return 'ACI Logistics Limited (Shwapno)';
    }
    if (textLower.includes('tractor') || textLower.includes('motor') || textLower.includes('yamaha')) {
      return 'ACI Motors Limited';
    }
    if (textLower.includes('neem') || textLower.includes('laboratory') || textLower.includes('facewash')) {
      return 'Neem Laboratories (Pvt.) Ltd.';
    }
    
    return 'ACI Limited (Pharma)'; // default to pharma
  };

  const handleOpenForward = (msg: ChatMessage) => {
    setSelectedMsgForForward(msg);
    const detected = detectBusinessFromMessage(msg.text);
    setForwardBusiness(detected);
    
    // Find previous user message for context
    const msgIndex = messages.findIndex(m => m.id === msg.id);
    let lastUserMsg = '';
    if (msgIndex > 0) {
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (messages[i].sender === 'user') {
          lastUserMsg = messages[i].text;
          break;
        }
      }
    }
    setCustomerNote(lastUserMsg || 'Customer is asking for detailed product support.');
    setIsForwardOpen(true);
    setIsForwardSuccess(false);
  };

  const handleConfirmForward = () => {
    setIsForwarding(true);
    
    // Simulate API call to send message
    setTimeout(() => {
      setIsForwarding(false);
      setIsForwardSuccess(true);
      
      const rep = getRepresentativeForBusiness(forwardBusiness);
      
      // Mark as forwarded in ui
      if (selectedMsgForForward) {
        setForwardedMsgIds(prev => ({ ...prev, [selectedMsgForForward.id]: true }));
        
        // Add a system notification message to chat history
        const systemMsg: ChatMessage = {
          id: `system-forward-${Date.now()}`,
          sender: 'assistant',
          text: `📬 **[FORWARDED TO REPRESENTATIVE]**\n\nYour query has been forwarded to **${rep.name}** (${rep.title}).\n\n* **Division/Business:** ${rep.business}\n* **Representative Contact:** ${rep.mobile} / ${rep.email}\n* **Details Sent:** "${customerNote}"\n\nThey have been notified via ACI ERP Alert (SMS & Email) with our complete conversation thread, and will contact you directly at **${customerContact}** shortly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, systemMsg]);
      }
    }, 1500);
  };

  const handleCloseForward = () => {
    setIsForwardOpen(false);
    setSelectedMsgForForward(null);
  };

  // Helper to detect mentioned ACI Products in assistant messages
  const getMentionedProducts = (input: ChatMessage | string): Product[] => {
    const text = (typeof input === 'string' ? input : input.text).toLowerCase();
    const idsFromMsg = new Set(typeof input === 'string' ? [] : (input.productIds || []));
    const results: Product[] = [];
    const addedIds = new Set<string>();

    // 1. Check explicit productIds returned by API
    idsFromMsg.forEach(id => {
      const found = ACI_PRODUCTS.find(p => p.id === id);
      if (found && !addedIds.has(found.id)) {
        results.push(found);
        addedIds.add(found.id);
      }
    });

    // 2. Check product names, base names, and generic names
    ACI_PRODUCTS.forEach(product => {
      if (addedIds.has(product.id)) return;
      const full = product.name.toLowerCase();
      const baseName = full.split('(')[0].trim();
      const genericPart = full.includes('(') ? full.split('(')[1].replace(')', '').trim().toLowerCase() : '';
      const genericKeyword = genericPart ? genericPart.split(' ')[0] : '';

      if (
        text.includes(full) ||
        (baseName.length > 3 && text.includes(baseName)) ||
        (genericKeyword.length > 4 && text.includes(genericKeyword)) ||
        (product.id.startsWith('cb-') && text.includes((product.name.split(' ')[0].toLowerCase() + ' ' + (product.name.split(' ')[1] || '').toLowerCase()).trim()))
      ) {
        results.push(product);
        addedIds.add(product.id);
      }
    });

    // 3. Fallback: If message discusses stomach pain / acidity and no product was matched yet
    if (results.length === 0 && (text.includes('stomach') || text.includes('abdominal') || text.includes('gastric') || text.includes('acidity') || text.includes('spasmo'))) {
      const gastro = ACI_PRODUCTS.filter(p => p.id === 'ph-008' || p.id === 'ph-009' || p.id === 'ph-010');
      gastro.forEach(p => {
        if (!addedIds.has(p.id)) {
          results.push(p);
          addedIds.add(p.id);
        }
      });
    }

    return results;
  };

  const handleOpenProductDetail = (product: Product) => {
    setSelectedProductForModal(product);
    if (onViewProduct) {
      onViewProduct(product);
    }
  };

  const handleQuickAdd = (product: Product) => {
    onAddToCart(product, 1);
    setAddedProduct(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedProduct(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="flex flex-col relative h-[500px] sm:h-[550px] md:h-[650px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl" id="chat-assistant-container">
      {/* Chat Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white tracking-wide">ACI Order Assistant</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-medium">Smart Product Advisor</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleClearHistory}
          className="text-[11px] text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
          title="Clear Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Suggestion Quick Chips */}
      <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/40 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-[10px] text-slate-500 font-semibold uppercase shrink-0">Ask me:</span>
        <div className="flex gap-1.5 shrink-0">
          {suggestionChips.map((chip, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSendMessage(chip.query)}
              className="px-3 py-1 bg-slate-800/40 hover:bg-red-950/40 hover:border-red-500/40 border border-slate-800 text-[11px] text-slate-300 rounded-full transition-all cursor-pointer"
            >
              {chip.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/90 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const mentionedProducts = !isUser ? getMentionedProducts(msg) : [];

            return (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, x: isUser ? 24 : -24, y: 12 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`flex gap-3.5 max-w-[90%] sm:max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser 
                    ? 'bg-red-600 border border-red-500 text-white' 
                    : 'bg-slate-950 border border-slate-800 text-red-500'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Content */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className={`p-3.5 rounded-2xl shadow-xs text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-red-600 text-white rounded-tr-none' 
                      : 'bg-slate-950 text-slate-200 border border-slate-800/60 rounded-tl-none'
                  }`}>
                    {/* Process text line by line to keep formatting nicely */}
                    <div className="whitespace-pre-line text-xs md:text-sm">
                      {msg.text}
                    </div>
                    <div className={`text-[9px] mt-2 text-right ${isUser ? 'text-red-200' : 'text-slate-500'}`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  {!isUser && msg.id !== 'welcome-msg' && !msg.id.startsWith('system-forward-') && (
                    <div className="flex justify-start pt-1">
                      {forwardedMsgIds[msg.id] ? (
                        <span className="text-[10px] bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Forwarded to Representative
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenForward(msg)}
                          className="text-[10px] xs:text-xs text-red-400 hover:text-white bg-slate-800/60 hover:bg-red-600 border border-slate-700/50 hover:border-red-500 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          Not fully answered? Forward to Representative
                        </button>
                      )}
                    </div>
                  )}

                  {/* Mentioned Products Integration Inside Chat with Direct Link to Product Page */}
                  {mentionedProducts.length > 0 && (
                    <div className="space-y-2 mt-2.5 max-w-lg">
                      <div className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        <span>Suggested Products (Click to view full page):</span>
                      </div>

                      {mentionedProducts.map(p => {
                        const inCartCount = cartItemsCount[p.id] || 0;
                        const isProductAdded = addedProduct[p.id];
                        return (
                          <div 
                            key={p.id} 
                            className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg transition-all"
                          >
                            {/* Product Info & Thumbnail */}
                            <div 
                              onClick={() => handleOpenProductDetail(p)}
                              className="flex items-center gap-3 cursor-pointer group flex-1 min-w-0"
                              title="Click to open product page"
                            >
                              <div className="w-13 h-13 rounded-xl bg-slate-900 border border-slate-800 shrink-0 overflow-hidden relative shadow-inner flex items-center justify-center">
                                <img
                                  src={p.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=120'}
                                  alt={p.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  <span className="text-[8px] px-1.5 py-0.5 bg-red-950/80 border border-red-800/80 text-red-300 font-bold rounded-sm">
                                    {p.division}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-medium truncate">{p.category}</span>
                                </div>
                                <div className="font-bold text-xs text-white group-hover:text-red-400 transition-colors flex items-center gap-1">
                                  <span className="truncate">{p.name}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-red-400 shrink-0" />
                                </div>
                                <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
                                  ৳{p.price} BDT <span className="text-slate-400 font-normal text-[10px]">/ {p.unit}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Direct Product Actions */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenProductDetail(p)}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-red-400" />
                                <span>Product Page</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleQuickAdd(p)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                                  isProductAdded 
                                    ? 'bg-emerald-600 text-white'
                                    : inCartCount > 0 
                                    ? 'bg-slate-800 text-red-400 border border-slate-700 hover:bg-slate-700'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                              >
                                {isProductAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    Added!
                                  </>
                                ) : inCartCount > 0 ? (
                                  <>
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    In Cart ({inCartCount})
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    Add to Cart
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-3.5 max-w-[80%]">
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-red-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-slate-950 border border-slate-800 text-slate-400 p-4 rounded-2xl rounded-tl-none flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
              <span className="text-xs font-medium tracking-wide">Analyzing inventory and generating advice...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask ACI assistant about medicines, crops, seeds, Savlon, prices..."
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-red-500 text-xs md:text-sm text-slate-200 placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-hidden transition-colors"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl disabled:opacity-40 transition-all shadow-md shrink-0 flex items-center justify-center"
          disabled={isLoading || !inputText.trim()}
        >
          <Send className="w-4 h-4 md:w-5 h-5" />
        </button>
      </form>

      {/* Forward to Representative Modal Overlay */}
      <AnimatePresence>
        {isForwardOpen && selectedMsgForForward && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xs flex flex-col justify-between p-3 sm:p-4 overflow-y-auto" 
            id="forward-modal-overlay"
          >
            <motion.div 
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md mx-auto my-auto overflow-hidden shadow-2xl flex flex-col max-h-[95%]"
            >
              
              {/* Modal Header */}
              <div className="bg-slate-950 p-3 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-red-500">
                  <UserCheck className="w-4 h-4 sm:w-5 h-5" />
                  <span className="font-bold text-xs sm:text-sm text-white">Forward Query to Representative</span>
                </div>
                <button 
                  type="button"
                  onClick={handleCloseForward}
                  className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 sm:w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              {isForwardSuccess ? (
                <div className="p-5 sm:p-6 text-center space-y-3 sm:space-y-4 my-auto overflow-y-auto">
                  <div className="w-12 h-12 sm:w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-6 h-6 sm:w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-lg text-white">Dispatch Successful!</h4>
                  <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    Your chat logs and query details have been compiled and sent via <strong>ACI ERP Direct SMS & Email</strong> to the designated representative.
                  </p>
                  
                  {(() => {
                    const rep = getRepresentativeForBusiness(forwardBusiness);
                    return (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-left space-y-1 sm:space-y-1.5 max-w-sm mx-auto text-[10px] sm:text-xs">
                        <div className="text-slate-400 font-bold uppercase text-[8px] sm:text-[9px] tracking-wider">Representative Assigned</div>
                        <div className="font-bold text-white text-xs sm:text-sm">{rep.name}</div>
                        <div className="text-red-400 font-medium text-[9px] sm:text-[10px]">{rep.title}</div>
                        <div className="pt-0.5 text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-500" /> {rep.mobile}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-500" /> {rep.email}
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={handleCloseForward}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-2.5 rounded-xl text-xs transition-all shadow-md mt-2 cursor-pointer"
                  >
                    Return to Chat
                  </button>
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleConfirmForward();
                  }}
                  className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1 text-left"
                >
                  <div className="space-y-1">
                    <label className="block text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Select ACI Business Unit
                    </label>
                    <select
                      value={forwardBusiness}
                      onChange={(e) => setForwardBusiness(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs focus:outline-hidden focus:border-red-500 cursor-pointer"
                    >
                      {BUSINESSES.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Show Selected Representative Live info */}
                  {(() => {
                    const rep = getRepresentativeForBusiness(forwardBusiness);
                    return (
                      <div className="bg-slate-950 p-2 sm:p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 shadow-inner">
                        <div>
                          <div className="text-[8px] text-red-500 font-bold uppercase tracking-wider">Assigned Representative</div>
                          <div className="font-bold text-slate-200 text-xs">{rep.name}</div>
                          <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{rep.title}</div>
                          <div className="text-[8px] sm:text-[9px] text-slate-500 mt-0.5 uppercase font-semibold">Region: {rep.region}</div>
                        </div>
                        <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-red-950/20 text-red-400 border border-red-500/10 flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0">
                          {rep.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-1">
                    <label className="block text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Your Store / Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs focus:outline-hidden focus:border-red-500"
                      placeholder="Enter your store name"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Your Contact Mobile/Email
                    </label>
                    <input
                      type="text"
                      required
                      value={customerContact}
                      onChange={(e) => setCustomerContact(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs focus:outline-hidden focus:border-red-500"
                      placeholder="e.g. +880 1712-345678"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Query Context / Message details to Representative
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs focus:outline-hidden focus:border-red-500 resize-none"
                      placeholder="Describe your inquiry in detail..."
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseForward}
                      className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-2 sm:py-2.5 rounded-xl text-xs transition-all border border-slate-700/60 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isForwarding}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold py-2 sm:py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      {isForwarding ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Forwarding...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Forward Now
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dedicated Product Detail Page Modal */}
      {selectedProductForModal && (
        <ProductDetailModal
          product={selectedProductForModal}
          onClose={() => setSelectedProductForModal(null)}
          onAddToCart={onAddToCart}
          inCartCount={cartItemsCount[selectedProductForModal.id] || 0}
          onNavigateToCatalog={onNavigateToCatalog}
        />
      )}
    </div>
  );
};
