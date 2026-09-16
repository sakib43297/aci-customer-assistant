import { useState } from 'react';
import { CartItem } from '../types';
import { getRepresentativeForBusiness, BusinessRepresentative } from '../data/representatives';
import { 
  Phone, 
  Mail, 
  Send, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  MapPin, 
  FileText,
  User,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

interface OrderRepresentativesPanelProps {
  orderId: string;
  items: CartItem[];
  storeName: string;
  shippingAddress: string;
  onShowToast: (msg: string) => void;
}

export function OrderRepresentativesPanel({
  orderId,
  items,
  storeName,
  shippingAddress,
  onShowToast
}: OrderRepresentativesPanelProps) {
  // Group items by business
  const groupedByBusiness = items.reduce<Record<string, { representative: BusinessRepresentative; items: CartItem[] }>>((acc, item) => {
    const bizName = item.product.business || 'ACI General Delivery Hub';
    if (!acc[bizName]) {
      acc[bizName] = {
        representative: getRepresentativeForBusiness(bizName),
        items: []
      };
    }
    acc[bizName].items.push(item);
    return acc;
  }, {});

  const businesses = Object.keys(groupedByBusiness);

  // States
  const [expandedBiz, setExpandedBiz] = useState<Record<string, boolean>>({});
  const [callingRep, setCallingRep] = useState<BusinessRepresentative | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const [callIntervalId, setCallIntervalId] = useState<NodeJS.Timeout | null>(null);

  const toggleBiz = (biz: string) => {
    setExpandedBiz(prev => ({ ...prev, [biz]: !prev[biz] }));
  };

  // Simulate calling a representative
  const handleStartCall = (rep: BusinessRepresentative) => {
    if (callingRep) {
      handleEndCall();
    }
    
    setCallingRep(rep);
    setIsRinging(true);
    setCallDuration(0);
    onShowToast(`Ringing representative ${rep.name}...`);

    // Ring for 2 seconds, then "answer"
    const ringTimer = setTimeout(() => {
      setIsRinging(false);
      onShowToast(`Call answered by ${rep.name}. Simulated call is active!`);
      
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      setCallIntervalId(interval);
    }, 2000);

    // Save timer id as interval identifier
    setCallIntervalId(ringTimer);
  };

  const handleEndCall = () => {
    if (callIntervalId) {
      clearInterval(callIntervalId);
      clearTimeout(callIntervalId);
    }
    setCallingRep(null);
    setIsRinging(false);
    setCallDuration(0);
    setCallIntervalId(null);
    onShowToast("Call disconnected.");
  };

  // Helper to format call duration
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-red-600" />
          <h3 className="font-extrabold text-slate-800 text-sm">Dispatched Business Representatives</h3>
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          ERP Direct Dispatched
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        ACI ERP has split the order by manufacturing units and automatically dispatched SMS and Email order instructions to the designated business representatives below:
      </p>

      {businesses.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-500">No items detected to assign representatives.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {businesses.map((biz) => {
            const data = groupedByBusiness[biz];
            const rep = data.representative;
            const repInitials = getInitials(rep.name);
            const isExpanded = expandedBiz[biz];

            // Generate representative SMS template
            const smsContent = `ACI-ERP ALERT! New order ${orderId} placed by store "${storeName}". Items: ${data.items.map(i => `${i.product.name} (Qty: ${i.quantity})`).join(', ')}. Delivery region: ${rep.region}. Destination Address: ${shippingAddress}. Please proceed with local distribution and dispatch.`;

            return (
              <div 
                key={biz} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition-all"
              >
                {/* Rep Header/Overview */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100/50 flex items-center justify-center font-extrabold text-xs tracking-wider">
                      {repInitials}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        {rep.name}
                        <span className="text-[10px] text-slate-400 font-normal">({rep.region})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">{rep.title}</p>
                      <span className="text-[10px] text-red-600 font-bold tracking-tight bg-red-50 border border-red-100/40 px-1.5 py-0.2 rounded mt-1 inline-block">
                        {biz}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartCall(rep)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-all flex items-center justify-center"
                      title={`Simulate phone call to ${rep.name}`}
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rep.email);
                        onShowToast(`Representative email copied: ${rep.email}`);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-all flex items-center justify-center"
                      title="Copy Email Address"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleBiz(biz)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-all flex items-center justify-center"
                      title="View Dispatched Notification Messages"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Body: Items and details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Items to fulfill ({data.items.length})</h5>
                    <div className="space-y-1">
                      {data.items.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            <span className="font-semibold text-slate-700">{item.product.name}</span>
                          </div>
                          <span className="font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dispatched Logs (Collapsible) */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-fade-in">
                      {/* Live notification logs */}
                      <div className="space-y-2">
                        <div className="bg-slate-900 text-slate-300 rounded-xl p-3 font-mono text-[11px] relative">
                          <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-1.5 mb-1.5">
                            <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Secure ERP SMS Gateway
                            </span>
                            <span>Target: {rep.mobile}</span>
                          </div>
                          <p className="leading-relaxed text-slate-200 text-xs">
                            "{smsContent}"
                          </p>
                          <div className="mt-2 text-[9px] text-emerald-400 flex items-center gap-1 justify-end font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            Dispatched (Status: DELIVERED)
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-3">
                          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700">Email Invoice Routed</p>
                            <p className="text-[10px] text-slate-400 truncate">Sent to: {rep.email}</p>
                            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                              Contains full PDF receipt copy, shipping credentials, client profile details, and automatic payment status logs.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Manual simulation trigger */}
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => {
                            onShowToast(`Resending notification to representative ${rep.name}...`);
                            setTimeout(() => {
                              onShowToast(`Notification successfully re-dispatched to ${rep.name}!`);
                            }, 1000);
                          }}
                          className="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Resend Gateway Alert
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Call Simulation Overlay */}
      {callingRep && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-800 text-white rounded-3xl p-8 max-w-sm w-full border border-slate-700 shadow-2xl text-center space-y-6 animate-scale relative overflow-hidden">
            {/* Ambient Animated pulse backgrounds */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-800 to-slate-900 opacity-90" />
            
            <div className="space-y-2">
              <span className="text-[10px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold tracking-widest animate-pulse inline-block">
                {isRinging ? 'Ringing representative...' : 'Call in Progress'}
              </span>
              <h3 className="text-xl font-extrabold text-white mt-3">{callingRep.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{callingRep.mobile}</p>
              <p className="text-xs text-slate-400 font-medium italic mt-1">"{callingRep.business}"</p>
            </div>

            {/* Glowing avatar */}
            <div className="relative inline-flex mx-auto justify-center items-center">
              <div className="absolute inset-0 rounded-full bg-red-600/20 blur-xl animate-pulse" />
              <div className={`w-28 h-28 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center text-3xl font-black tracking-widest ${isRinging ? 'animate-bounce' : 'animate-pulse'}`}>
                {getInitials(callingRep.name)}
              </div>
              
              {!isRinging && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2.5 rounded-full text-white shadow-lg animate-ping">
                  <Phone className="w-5 h-5 fill-current" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Call timing info */}
              <div className="text-xs text-slate-300 font-medium">
                {isRinging ? (
                  <span className="text-slate-400 italic">Waiting for representative to pick up...</span>
                ) : (
                  <div className="space-y-1">
                    <p className="font-mono text-lg font-bold tracking-widest text-emerald-400">{formatTime(callDuration)}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Connected via ACI ERP VoIP</p>
                  </div>
                )}
              </div>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center mx-auto shadow-lg hover:shadow-red-600/30 active:scale-95 transition-all"
                title="Disconnect call"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Simulated scripts */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 text-left text-xs text-slate-300 space-y-2 max-h-36 overflow-y-auto">
              <p className="font-bold text-slate-400 border-b border-slate-800 pb-1 flex items-center gap-1.5 text-[10px] uppercase">
                <FileText className="w-3.5 h-3.5" />
                Simulated Conversation Guide
              </p>
              {isRinging ? (
                <p className="italic text-slate-500">VOIP system establishing safe mobile link through Grameenphone network...</p>
              ) : (
                <div className="space-y-2 font-mono text-[11px] leading-relaxed">
                  <p><span className="text-emerald-400 font-bold">REP:</span> "Hello! S.M. Ashraful here from ACI. I received the automated ERP SMS alert for order {orderId}."</p>
                  <p><span className="text-red-400 font-bold">YOU:</span> "Yes, we just placed the order from our store '{storeName}'. Can you expedite delivery?"</p>
                  <p><span className="text-emerald-400 font-bold">REP:</span> "Certainly! I see the items are in stock at the local warehouse. I will personally supervise dispatch and update the status. Delivery is slated for tomorrow morning!"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
