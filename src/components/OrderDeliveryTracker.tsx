import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  User, 
  Phone, 
  AlertTriangle, 
  Navigation, 
  RefreshCw,
  TrendingUp,
  Map as MapIcon,
  Zap,
  Check,
  Flag
} from 'lucide-react';
import { getRepresentativeForBusiness } from '../data/representatives';
import { Order, OrderStatus, CartItem } from '../types';

interface OrderDeliveryTrackerProps {
  order: Order;
  onClose: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

// Dhaka coordinates simulation points
const DHAKA_POINTS = {
  start: { x: 260, y: 110, label: "ACI Depot (Tejgaon)" },
  mid1: { x: 200, y: 150, label: "Hatirjheel Route" },
  mid2: { x: 130, y: 190, label: "Panthapath Intersection" },
  end: { x: 80, y: 240, label: "Dhanmondi (Store)" }
};

// Outside Dhaka (National Highway) points
const REGIONAL_POINTS = {
  start: { x: 320, y: 80, label: "ACI Gazipur Hub" },
  mid1: { x: 220, y: 110, label: "Sirajganj Highway" },
  mid2: { x: 140, y: 170, label: "Natore Bypass" },
  end: { x: 60, y: 250, label: "Rajshahi/Chittagong Depot" }
};

export function OrderDeliveryTracker({ order, onClose, onUpdateOrderStatus }: OrderDeliveryTrackerProps) {
  // Determine if inside Dhaka or outside
  const isInsideDhaka = order.deliveryLocation === 'inside' || 
    ['aci-centre', 'nobo-tower', 'santa-forum', 'police-plaza'].includes(order.deliveryLocation || '');

  // Detailed stages
  // Stage index matches: 0 = Placed, 1 = Packed, 2 = Shipped (Transit), 3 = Out for Delivery, 4 = Delivered
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [trafficDelay, setTrafficDelay] = useState<boolean>(false);
  const [gpsProgress, setGpsProgress] = useState<number>(0.2); // 0.0 to 1.0 Along path
  const [etaOffset, setEtaOffset] = useState<number>(0); // in minutes
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Derive initial stage index from order status
  useEffect(() => {
    if (order.status === 'Pending') {
      setStageIndex(0); // Order Received
      setGpsProgress(0);
    } else if (order.status === 'Confirmed' || order.status === 'Processing') {
      setStageIndex(1); // Packaging / Processing
      setGpsProgress(0);
    } else if (order.status === 'Shipped' || order.status === 'In Transit') {
      setStageIndex(3); // Out for delivery / In transit
      setGpsProgress(0.65);
    } else if (order.status === 'Delivered') {
      setStageIndex(4); // Delivered
      setGpsProgress(1.0);
    } else if (order.status === 'Cancelled') {
      setStageIndex(0);
      setGpsProgress(0);
    }
  }, [order.status]);

  // Simulate GPS coordinates moving
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating && stageIndex >= 2 && stageIndex < 4) {
      timer = setInterval(() => {
        setGpsProgress(prev => {
          if (prev >= 1) {
            // Arrived
            handleAdvanceStage(4);
            return 1.0;
          }
          const step = trafficDelay ? 0.01 : 0.03;
          return Math.min(1.0, prev + step);
        });
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isSimulating, stageIndex, trafficDelay]);

  // Handle stage index manual advancement
  const handleAdvanceStage = (index: number) => {
    setStageIndex(index);
    if (index === 0 || index === 1) {
      onUpdateOrderStatus(order.id, 'Processing');
      setGpsProgress(0);
    } else if (index === 2 || index === 3) {
      onUpdateOrderStatus(order.id, 'In Transit');
      if (gpsProgress === 0 || gpsProgress === 1.0) {
        setGpsProgress(0.35);
      }
    } else if (index === 4) {
      onUpdateOrderStatus(order.id, 'Delivered');
      setGpsProgress(1.0);
    }
  };

  const toggleTrafficDelay = () => {
    setTrafficDelay(prev => !prev);
    setEtaOffset(prev => (prev === 0 ? 15 : 0));
  };

  // Coordinates based on progress
  const getCoordinates = () => {
    const pts = isInsideDhaka ? DHAKA_POINTS : REGIONAL_POINTS;
    let x = pts.start.x;
    let y = pts.start.y;

    if (gpsProgress <= 0.33) {
      const t = gpsProgress / 0.33;
      x = pts.start.x + (pts.mid1.x - pts.start.x) * t;
      y = pts.start.y + (pts.mid1.y - pts.start.y) * t;
    } else if (gpsProgress <= 0.66) {
      const t = (gpsProgress - 0.33) / 0.33;
      x = pts.mid1.x + (pts.mid2.x - pts.mid1.x) * t;
      y = pts.mid1.y + (pts.mid2.y - pts.mid1.y) * t;
    } else {
      const t = (gpsProgress - 0.66) / 0.34;
      x = pts.mid2.x + (pts.end.x - pts.mid2.x) * t;
      y = pts.mid2.y + (pts.end.y - pts.mid2.y) * t;
    }
    return { x, y };
  };

  const vehiclePos = getCoordinates();

  // Representative Info
  const mainBiz = order.items[0]?.product.business || 'ACI Pharmaceuticals';
  const representative = getRepresentativeForBusiness(mainBiz);

  // Stages array definition
  const stages = [
    {
      title: "Order Submitted",
      desc: "ACI ERP authenticated purchase credentials and locked trade discounts.",
      time: "Today, 09:15 AM",
      icon: Clock,
      status: stageIndex >= 0 ? "completed" : "pending"
    },
    {
      title: "Packed & Verified",
      desc: `Representative ${representative.name} cleared inventory stock at central depot.`,
      time: "Today, 10:02 AM",
      icon: Package,
      status: stageIndex >= 1 ? "completed" : "pending"
    },
    {
      title: "Dispatched",
      desc: "Order transferred to ACI Logistics Fleet. Main highway transit started.",
      time: stageIndex >= 2 ? "Today, 10:30 AM" : "Pending dispatch",
      icon: Navigation,
      status: stageIndex >= 2 ? (stageIndex === 2 ? "active" : "completed") : "pending"
    },
    {
      title: "Out for Delivery",
      desc: "Final courier dispatch with invoice and trade receipts. Transit active.",
      time: stageIndex >= 3 ? "Today, 11:05 AM" : "Awaiting destination depot",
      icon: Truck,
      status: stageIndex >= 3 ? (stageIndex === 3 ? "active" : "completed") : "pending"
    },
    {
      title: "Delivered",
      desc: "Successfully verified, signed and received by customer retail store.",
      time: stageIndex >= 4 ? "Today, 11:45 AM" : "Awaiting final dropoff",
      icon: Flag,
      status: stageIndex >= 4 ? "completed" : "pending"
    }
  ];

  // Derive values for display
  const etaTime = trafficDelay ? "12:15 PM" : "11:45 AM";
  const speed = stageIndex < 2 || stageIndex === 4 ? 0 : (trafficDelay ? 14 : 38);
  const distanceRemaining = stageIndex >= 4 ? "0 km" : (isInsideDhaka ? `${((1 - gpsProgress) * 4.2).toFixed(1)} km` : `${((1 - gpsProgress) * 142).toFixed(0)} km`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh] md:h-[650px]"
      >
        {/* LEFT COLUMN: INTERACTIVE VISUAL MAP & TELEMETRY */}
        <div className="w-full md:w-3/5 p-4 sm:p-6 flex flex-col justify-between bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
          {/* Futuristic Map Glow Effects */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Map Header */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600/15 border border-red-500/25 flex items-center justify-center text-red-500">
                <MapIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider font-mono">Live Delivery Map</h3>
                <p className="text-[10px] text-slate-400">ACI ERP Automated GPS Tracker</p>
              </div>
            </div>

            {/* Simulated status pills */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] px-2.5 py-0.5 rounded-md font-mono font-bold uppercase ${
                stageIndex === 4 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse'
              }`}>
                {stages[stageIndex].title}
              </span>
            </div>
          </div>

          {/* Map Body: Customized Vector SVG Route Map */}
          <div className="flex-1 bg-slate-900/40 rounded-2xl border border-slate-800/80 relative overflow-hidden my-3 min-h-[180px] xs:min-h-[220px] md:min-h-0">
            {/* Custom SVG stylized coordinate road grid */}
            <svg className="w-full h-full absolute inset-0 text-slate-800/20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="destGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Regional outlines / Road simulation lines */}
              {isInsideDhaka ? (
                <>
                  {/* Road Network Lines */}
                  <path d="M 50,220 C 100,180 150,150 200,120 L 250,90" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
                  <path d="M 120,40 L 160,110 L 200,150 L 320,180" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
                  <path d="M 80,240 L 130,190 L 200,150 L 260,110" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                  
                  {/* Route Track - highlights route progress */}
                  <path 
                    d="M 260,110 L 200,150 L 130,190 L 80,240" 
                    fill="none" 
                    stroke={trafficDelay ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    strokeDasharray="6,4"
                    className="animate-dash"
                  />
                  
                  {/* Local Area Names */}
                  <text x="240" y="90" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.7">Tejgaon Hub</text>
                  <text x="180" y="135" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.5">Hatirjheel</text>
                  <text x="140" y="175" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.5">Panthapath</text>
                  <text x="60" y="225" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.7">Dhanmondi (Outlet)</text>
                </>
              ) : (
                <>
                  {/* Bangladesh Regional Major Highways */}
                  <path d="M 50,270 L 120,180 L 200,120 L 320,80" fill="none" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 120,180 L 150,240 L 250,290" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" opacity="0.2" />
                  
                  {/* Highway Route path track */}
                  <path 
                    d="M 320,80 L 220,110 L 140,170 L 60,250" 
                    fill="none" 
                    stroke={trafficDelay ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    strokeDasharray="6,4"
                  />
                  
                  {/* Landmarks */}
                  <text x="280" y="65" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.7">Gazipur Central Depot</text>
                  <text x="185" y="95" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.5">Sirajganj Bypass</text>
                  <text x="130" y="155" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.5">Natore Highway</text>
                  <text x="40" y="235" fill="#94a3b8" fontSize="8" fontFamily="monospace" opacity="0.7">{order.shippingAddress?.split(',')[0] || 'Regional Store'}</text>
                </>
              )}
            </svg>

            {/* Glowing Map Spots */}
            {/* 1. Source Spot */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
              style={{ 
                left: isInsideDhaka ? DHAKA_POINTS.start.x : REGIONAL_POINTS.start.x, 
                top: isInsideDhaka ? DHAKA_POINTS.start.y : REGIONAL_POINTS.start.y 
              }}
            >
              <div className="w-8 h-8 rounded-full bg-red-500/20 absolute -z-10 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-red-600 border border-white flex items-center justify-center text-[9px] font-bold text-white shadow-lg">
                H
              </div>
              <span className="text-[7px] font-bold bg-slate-950/90 text-red-400 border border-red-500/20 px-1 py-0.2 rounded font-mono mt-1 whitespace-nowrap">
                {isInsideDhaka ? "ACI Depot (Tejgaon)" : "ACI Gazipur Hub"}
              </span>
            </div>

            {/* 2. Destination Spot */}
            <div 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
              style={{ 
                left: isInsideDhaka ? DHAKA_POINTS.end.x : REGIONAL_POINTS.end.x, 
                top: isInsideDhaka ? DHAKA_POINTS.end.y : REGIONAL_POINTS.end.y 
              }}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 absolute -z-10 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white shadow-lg">
                <MapPin className="w-3 h-3" />
              </div>
              <span className="text-[7px] font-bold bg-slate-950/90 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-mono mt-1 whitespace-nowrap truncate max-w-[80px]">
                {order.shippingAddress?.split(',')[0] || "Store"}
              </span>
            </div>

            {/* 3. Animating Transit Vehicle Spot (Pulsing) */}
            {stageIndex >= 2 && stageIndex < 4 && (
              <motion.div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
                style={{ left: vehiclePos.x, top: vehiclePos.y }}
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <div className={`w-8 h-8 rounded-full absolute -z-10 animate-ping ${trafficDelay ? 'bg-amber-500/20' : 'bg-red-500/20'}`} />
                <div className={`w-6 h-6 rounded-lg ${trafficDelay ? 'bg-amber-500 border-amber-300' : 'bg-red-600 border-red-400'} border flex items-center justify-center text-white shadow-xl`}>
                  <Truck className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="bg-slate-950/90 text-white border border-slate-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-md font-mono mt-1.5 flex items-center gap-1 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {trafficDelay ? "Delayed" : "GPS Live"}
                </div>
              </motion.div>
            )}
          </div>

          {/* Telemetry telemetry bar (Speed, distance, ETAs) */}
          <div className="grid grid-cols-4 gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-3 z-10">
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">ETA</p>
              <p className="text-white text-xs sm:text-sm font-extrabold font-mono mt-0.5">{stageIndex >= 4 ? "Delivered" : etaTime}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Distance</p>
              <p className="text-white text-xs sm:text-sm font-extrabold font-mono mt-0.5">{distanceRemaining}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Avg Speed</p>
              <p className="text-white text-xs sm:text-sm font-extrabold font-mono mt-0.5">{speed} km/h</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Transport</p>
              <p className="text-white text-xs sm:text-sm font-extrabold truncate mt-0.5">ACI Express</p>
            </div>
          </div>

          {/* SIMULATION CONTROL BUTTONS BAR */}
          <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider font-mono">Interactive Sandbox Controls</span>
            </div>
            
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={toggleTrafficDelay}
                className={`flex-1 sm:flex-initial text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                  trafficDelay
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-900/10'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
                title="Simulate severe traffic on Dhaka-Mymensingh highway or local roads"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {trafficDelay ? "Clear Traffic Jam" : "Simulate Traffic"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setGpsProgress(0.2);
                  setTrafficDelay(false);
                  setEtaOffset(0);
                  setIsSimulating(true);
                  handleAdvanceStage(2);
                }}
                className="flex-1 sm:flex-initial text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Re-run route path calculation and GPS mock coords stream"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Route
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STEP TIMELINE LIST & SIMULATOR ACCELERATION */}
        <div className="w-full md:w-2/5 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto bg-slate-900">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                Milestone Progress
              </h3>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Order Summary mini display */}
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Tracking Reference</p>
                <p className="text-white font-extrabold mt-0.5">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Invoice Value</p>
                <p className="text-red-400 font-extrabold font-mono mt-0.5">৳{order.totalPrice.toLocaleString()} BDT</p>
              </div>
            </div>

            {/* Vertical Milestones Timeline Progress */}
            <div className="relative pl-6 space-y-6 pt-1">
              {/* Timeline spine bar */}
              <div className="absolute top-0 bottom-0 left-2.5 w-0.5 bg-slate-800" />

              {stages.map((st, idx) => {
                const Icon = st.icon;
                const isActive = stageIndex === idx;
                const isCompleted = stageIndex > idx || (idx === 4 && stageIndex === 4);

                return (
                  <div key={idx} className="relative flex gap-4 items-start group">
                    {/* Circle Pin Node */}
                    <div className="absolute -left-6 transform translate-x-[4px] mt-0.5 z-10">
                      <div 
                        onClick={() => handleAdvanceStage(idx)}
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 scale-110 shadow-lg shadow-emerald-500/20'
                            : isActive
                            ? 'bg-red-500 text-white scale-110 shadow-lg shadow-red-500/20 animate-pulse'
                            : 'bg-slate-800 border border-slate-700 text-slate-500 hover:border-slate-500 hover:text-white'
                        }`}
                        title={`Force transition to: ${st.title}`}
                      >
                        {isCompleted ? (
                          <Check className="w-3 h-3 font-black" />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-500'}`} />
                        )}
                      </div>
                    </div>

                    {/* Step Card Text Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-extrabold transition-colors ${
                          isActive 
                            ? 'text-red-400' 
                            : isCompleted 
                            ? 'text-white' 
                            : 'text-slate-500'
                        }`}>
                          {st.title}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono">{st.time}</span>
                      </div>
                      <p className={`text-[10px] sm:text-xs mt-1 leading-relaxed ${
                        isActive 
                          ? 'text-slate-200 font-medium' 
                          : isCompleted 
                          ? 'text-slate-400' 
                          : 'text-slate-600'
                      }`}>
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Footer: Representative Quick Contact & Simulator speed controller */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
            {/* Courier driver assignment info */}
            <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-extrabold text-xs">
                  JA
                </div>
                <div>
                  <h4 className="text-white font-bold text-xs">Jahangir Alam</h4>
                  <p className="text-[10px] text-slate-500">Logistics Fleet Courier</p>
                </div>
              </div>
              <a 
                href="tel:+8801712345678"
                className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/15 p-2 rounded-xl transition-all"
                title="Dial driver mobile phone link"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Quick action: mark as complete */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all text-center cursor-pointer"
              >
                Close Tracking
              </button>
              
              {stageIndex < 4 && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage(4)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Received
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
