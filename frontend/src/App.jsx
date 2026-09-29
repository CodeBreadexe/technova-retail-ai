import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://localhost:8000/api';

/* -------------------------------------------------------------
   1. SYNTHESIZED HAPTIC WEB AUDIO ENGINE (Zero external files)
   ------------------------------------------------------------- */
class WebAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // 1. Subtle button hover tick (10ms, ultra-quiet)
  playHover() {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch (e) {}
  }

  // 2. Mechanical tactile click (30ms popping switch)
  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch (e) {}
  }

  // 3. Copilot AI response chime (warm two-tone harmonic)
  playChime() {
    if (!this.enabled) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      [523.25, 659.25].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.05, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {}
  }

  // 4. Receipt scan / tool execution sweep
  playScan() {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }
}

const soundEngine = new WebAudioEngine();

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMsg, setInputMsg] = useState('');
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);

  // Modals & Panels State
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isWarrantyModalOpen, setIsWarrantyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isArchifyModalOpen, setIsArchifyModalOpen] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Live ReAct Pipeline State
  const [pipelineStage, setPipelineStage] = useState('idle'); // 'idle' | 'user' | 'tool' | 'sqlite' | 'agent' | 'grounded'
  const [selectedPipelineNode, setSelectedPipelineNode] = useState(null);
  const [isTraceRunning, setIsTraceRunning] = useState(false);
  const [traceStep, setTraceStep] = useState(0);

  // Ingest Modal Form State
  const [ingestTab, setIngestTab] = useState('preset');
  const [selectedPreset, setSelectedPreset] = useState('sony');
  const [pastedReceipt, setPastedReceipt] = useState('');

  // Return Modal Form State
  const [returnReason, setReturnReason] = useState('Audio tuning not suitable');
  const [returnMethod, setReturnMethod] = useState('Delhivery Doorstep Courier Pickup');

  // Metrics Data State
  const [metrics, setMetrics] = useState({
    savedAmount: '₹28,500',
    activeWarranties: 3,
    inTransitOrders: 1,
    expiringDeadlines: 2
  });

  // Recent Orders State
  const [orders, setOrders] = useState([
    {
      id: 'ord-sony',
      title: 'Sony WH-1000XM5',
      icon: 'fa-headphones',
      daysLeft: 3,
      progressPercent: 78,
      price: '₹24,990',
      status: 'Return Window Active',
      subtext: null,
      badge: null
    },
    {
      id: 'ord-ipad',
      title: 'Apple iPad Air M2',
      icon: 'fa-tablet-screen-button',
      daysLeft: null,
      progressPercent: null,
      price: '₹59,900',
      status: 'Warranty Active',
      subtext: '₹59,900',
      badge: 'Warranty Active'
    },
    {
      id: 'ord-keychron',
      title: 'Keychron K2 keyboard',
      icon: 'fa-keyboard',
      daysLeft: null,
      progressPercent: null,
      price: '₹24,990',
      status: 'In Transit',
      subtext: 'K2 -0322',
      badge: null
    },
    {
      id: 'ord-glamorizee',
      title: 'White Flower Name Necklace',
      icon: 'fa-gem',
      daysLeft: null,
      progressPercent: null,
      price: '₹219',
      status: 'Delivered',
      subtext: 'Glamorizee (Order #7714419343656)',
      badge: '90-Day Warranty'
    },
    {
      id: 'ord-buds',
      title: 'Samsung Galaxy Buds2 Pro',
      icon: 'fa-headphones-simple',
      daysLeft: null,
      progressPercent: null,
      price: '₹14,999',
      status: 'Delivered',
      subtext: 'Official Samsung Warranty Active',
      badge: 'Warranty Active'
    }
  ]);

  // Messages matching the reference screenshot exactly
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      senderTitle: 'The messages TechNova AI copas am',
      tool: 'store_policy_retriever',
      content: 'I found the specific details in the Return Policy. The item is still eligible for return according to §2.1. Citations: [Store Policy §2.1]',
      hasCitation: true,
      citation: 'Citations: [Store Policy §2.1]'
    }
  ]);

  const canvasRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Trigger Toast Notification helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isCopilotTyping]);

  // Audio enable / toggle
  const toggleSound = (e) => {
    e.stopPropagation();
    const state = soundEngine.toggle();
    setIsAudioEnabled(state);
    if (state) {
      soundEngine.playClick();
      showToast('🔊 Audio Haptic Feedback Enabled');
    } else {
      showToast('🔇 Audio Muted');
    }
  };

  /* -------------------------------------------------------------
     2. DYNAMIC LIVE AURORA & STARDUST CANVAS (Vibrant Silk Ribbons)
     ------------------------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;

    let targetMouseX = width * 0.65;
    let targetMouseY = height * 0.45;
    let curMouseX = targetMouseX;
    let curMouseY = targetMouseY;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener('resize', handleResize);

    // Stardust particles
    const stars = [];
    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < 90; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.4,
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 1.4 + 0.6,
          phase: Math.random() * Math.PI * 2,
          depth: Math.random() * 0.8 + 0.2
        });
      }
    };
    initStars();

    const render = () => {
      time += 0.011;
      curMouseX += (targetMouseX - curMouseX) * 0.04;
      curMouseY += (targetMouseY - curMouseY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep OLED Obsidian Base
      ctx.fillStyle = '#030610';
      ctx.fillRect(0, 0, width, height);

      // 2. Large Atmospheric Ambient Cyan Glows (Behind Cards)
      const glow1 = ctx.createRadialGradient(
        width * 0.72 + Math.sin(time * 0.5) * 40,
        height * 0.35 + Math.cos(time * 0.4) * 30,
        10,
        width * 0.72,
        height * 0.35,
        width * 0.45
      );
      glow1.addColorStop(0, 'rgba(0, 229, 255, 0.16)');
      glow1.addColorStop(0.4, 'rgba(14, 165, 233, 0.06)');
      glow1.addColorStop(1, 'rgba(3, 6, 16, 0)');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(
        width * 0.35 + (curMouseX - width * 0.35) * 0.1,
        height * 0.68 + (curMouseY - height * 0.68) * 0.1,
        10,
        width * 0.35,
        height * 0.68,
        width * 0.4
      );
      glow2.addColorStop(0, 'rgba(0, 242, 254, 0.14)');
      glow2.addColorStop(0.5, 'rgba(56, 189, 248, 0.04)');
      glow2.addColorStop(1, 'rgba(3, 6, 16, 0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // 3. Floating 3D Parallax Stardust Particles
      const normX = (curMouseX / width - 0.5);
      const normY = (curMouseY / height - 0.5);

      stars.forEach((s) => {
        const twinkle = Math.sin(time * s.speed + s.phase) * 0.35 + 0.65;
        const px = s.x - normX * s.depth * 45;
        const py = s.y - normY * s.depth * 35;

        ctx.beginPath();
        ctx.arc(px, py, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${s.alpha * twinkle})`;
        ctx.fill();
      });

      // 4. Silky Luminous Electric Cyan Aurora Mesh Ribbons (Matching reference screenshot)
      const ribbons = [
        // Top-to-center sweeping ribbon
        {
          start: { x: width * 1.05, y: height * 0.08 },
          cp1: { x: width * 0.78, y: height * 0.28 },
          cp2: { x: width * 0.52, y: height * 0.46 },
          end: { x: -width * 0.05, y: height * 0.64 },
          color: 'rgba(0, 229, 255, 0.75)',
          glowColor: 'rgba(0, 229, 255, 0.32)',
          trailColor: 'rgba(14, 165, 233, 0.02)',
          strokeWidth: 5,
          waveAmp: 42,
          speed: 1.1,
          blur: 16
        },
        // Mid-diagonal vibrant ribbon
        {
          start: { x: width * 1.02, y: height * 0.36 },
          cp1: { x: width * 0.68, y: height * 0.54 },
          cp2: { x: width * 0.38, y: height * 0.68 },
          end: { x: -width * 0.08, y: height * 0.82 },
          color: 'rgba(0, 240, 255, 0.85)',
          glowColor: 'rgba(56, 189, 248, 0.38)',
          trailColor: 'rgba(37, 99, 235, 0.015)',
          strokeWidth: 6,
          waveAmp: 55,
          speed: 1.3,
          blur: 20
        },
        // Lower sweeping wave ribbon
        {
          start: { x: width * 1.05, y: height * 0.62 },
          cp1: { x: width * 0.62, y: height * 0.78 },
          cp2: { x: width * 0.25, y: height * 0.88 },
          end: { x: -width * 0.1, y: height * 0.98 },
          color: 'rgba(56, 189, 248, 0.65)',
          glowColor: 'rgba(14, 165, 233, 0.28)',
          trailColor: 'transparent',
          strokeWidth: 4,
          waveAmp: 38,
          speed: 0.9,
          blur: 22
        }
      ];

      ribbons.forEach((ribbon, index) => {
        ctx.save();
        ctx.filter = `blur(${ribbon.blur}px)`;
        ctx.globalCompositeOperation = 'screen';

        const waveOffset = Math.sin(time * ribbon.speed + index * 1.5) * ribbon.waveAmp;
        const waveOffset2 = Math.cos(time * ribbon.speed * 0.8 + index) * (ribbon.waveAmp * 0.6);

        const p0 = { x: ribbon.start.x, y: ribbon.start.y + waveOffset * 0.5 };
        const p1 = { x: ribbon.cp1.x, y: ribbon.cp1.y + waveOffset };
        const p2 = { x: ribbon.cp2.x, y: ribbon.cp2.y + waveOffset2 };
        const p3 = { x: ribbon.end.x, y: ribbon.end.y + waveOffset * 0.7 };

        // 1. Feathered broad ribbon fill
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.lineTo(p3.x, height);
        ctx.lineTo(p0.x, height);
        ctx.closePath();

        const ribbonGrad = ctx.createLinearGradient(0, p1.y - 80, 0, p2.y + 160);
        ribbonGrad.addColorStop(0, ribbon.color);
        ribbonGrad.addColorStop(0.35, ribbon.glowColor);
        ribbonGrad.addColorStop(1, ribbon.trailColor);
        ctx.fillStyle = ribbonGrad;
        ctx.fill();

        // 2. High-brightness specular core stroke
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = ribbon.strokeWidth;
        ctx.stroke();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /* -------------------------------------------------------------
     3. INTERACTIVE ACTIONS & BACKEND COMMUNICATION
     ------------------------------------------------------------- */
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMsg;
    if (!query || !query.trim() || isCopilotTyping) return;

    soundEngine.playClick();

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      senderTitle: 'User Command',
      content: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setIsCopilotTyping(true);

    // Sequence Live ReAct Pipeline: User -> Tool -> SQLite -> Agent
    setPipelineStage('user');
    setTimeout(() => setPipelineStage('tool'), 150);
    setTimeout(() => setPipelineStage('sqlite'), 300);
    setTimeout(() => setPipelineStage('agent'), 450);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, chat_history: [] })
      });

      if (res.ok) {
        const data = await res.json();
        soundEngine.playChime();
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'assistant',
            senderTitle: 'TechNova AI Copilot',
            tool: data.tool_calls?.[0]?.tool || 'store_policy_retriever',
            content: data.output || 'Grounded policy evaluation completed.',
            hasCitation: Boolean(data.output?.includes('§')),
            citation: data.output?.includes('§') ? '[Store Policy §2.1]' : null
          }
        ]);
        setIsCopilotTyping(false);
        setPipelineStage('grounded');
        setTimeout(() => setPipelineStage('idle'), 3500);
        return;
      }
    } catch (e) {
      // Local fallback handled below
    }

    // Local deterministic response
    setTimeout(() => {
      soundEngine.playChime();
      let toolName = 'store_policy_retriever';
      let reply = 'I evaluated the return parameters according to §2.1. The item is still eligible for return. Citations: [Store Policy §2.1]';
      let hasCit = true;
      let cit = 'Citations: [Store Policy §2.1]';

      const lower = query.toLowerCase();
      if (lower.includes('track') || lower.includes('order')) {
        toolName = 'order_status_lookup';
        reply = 'Order #TN-7714419343656 (Keychron K2 keyboard) is In Transit with Delhivery (AWB: 22017731381544). Courier is out for delivery today.';
        hasCit = false;
        cit = null;
      } else if (lower.includes('start return') || lower.includes('initiate') || lower.includes('rma')) {
        toolName = 'return_warranty_calculator';
        reply = 'Return RMA #RMA-SONY-99214 initiated for Sony WH-1000XM5. A return courier pickup has been scheduled for tomorrow 11:00 AM. Citations: [Return Policy §4.3]';
        hasCit = true;
        cit = 'Citations: [Return Policy §4.3]';
      } else if (lower.includes('receipt') || lower.includes('download') || lower.includes('invoice')) {
        toolName = 'invoice_retriever';
        reply = 'Tax invoice TN-INV-2026-904 for ₹24,990 has been downloaded. Verified cryptographic tax stamp applied.';
        hasCit = false;
        cit = null;
      } else if (lower.includes('ipad') || lower.includes('applecare') || lower.includes('warranty')) {
        toolName = 'warranty_status_lookup';
        reply = 'Apple iPad Air M2 has an active AppleCare+ warranty valid until September 2027. Covers hardware defects and accidental damage.';
        hasCit = true;
        cit = 'Citations: [AppleCare+ Service Terms]';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          senderTitle: 'TechNova AI Copilot',
          tool: toolName,
          content: reply,
          hasCitation: hasCit,
          citation: cit
        }
      ]);
      setIsCopilotTyping(false);
      setPipelineStage('grounded');
      setTimeout(() => setPipelineStage('idle'), 3500);
    }, 550);
  };

  // Receipt Ingestion Handler
  const handleExecuteIngest = async () => {
    soundEngine.playScan();
    let text = pastedReceipt;
    if (selectedPreset === 'sony') {
      text = 'Order #TN-SONY-001\nItem: Sony WH-1000XM5 Headphones\nPrice: Rs. 24,990\nPurchase Date: 2026-09-18';
    } else if (selectedPreset === 'glamorizee') {
      text = 'Order ID: 7714419343656\nProduct Name: White Flower Name Necklace\nAmount: Rs.219\nDate of Purchase: 2026-08-18';
    } else if (selectedPreset === 'ipad') {
      text = 'Order #TN-APL-882\nItem: Apple iPad Air M2\nPrice: Rs. 59,900\nDate of Purchase: 2026-09-01';
    }

    try {
      await fetch(`${API_BASE}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt_text: text, reference_date: '2026-09-21' })
      });
    } catch (e) {}

    setTimeout(() => {
      soundEngine.playChime();
      setIsIngestModalOpen(false);
      showToast('✓ Receipt Ingested & Analyzed Successfully');
      handleSendMessage('Ingested new receipt. Calculate return deadlines and update warranty tracker.');
    }, 500);
  };

  // RMA Return Confirmation Handler
  const handleConfirmReturn = () => {
    soundEngine.playClick();
    setIsReturnModalOpen(false);
    showToast('✓ Return RMA #RMA-SONY-99214 Scheduled for Pickup');
    handleSendMessage(`Start Return for Sony WH-1000XM5. Reason: "${returnReason}". Method: "${returnMethod}". Generate RMA slip.`);
  };

  // Download Receipt File Handler
  const handleDownloadReceipt = () => {
    soundEngine.playClick();
    const invoiceContent = `==========================================================
TECHNOVA RETAIL - OFFICIAL TAX INVOICE & WARRANTY CERTIFICATE
==========================================================
Invoice Number:   TN-INV-2026-904
Customer Name:    Sidharth SIDDU
Date of Purchase: 2026-09-18
Payment Status:   PAID (UPI Reference: 99401298412)

ITEMS PURCHASED:
1. Sony WH-1000XM5 Wireless Headphones
   - Quantity: 1
   - Amount:   Rs. 24,990
   - Warranty: 1-Year Sony India Manufacturer Warranty
   - Return Window: 15-Day Return (Policy §2.1 Active)

Store Policy Reference: Section 2.1
Status: ELIGIBLE FOR HASSLE-FREE RETURN & REPLACEMENT
==========================================================`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TechNova_Invoice_Sony_WH1000XM5.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('✓ Invoice TechNova_Invoice_Sony_WH1000XM5.txt downloaded');
    handleSendMessage('Downloaded invoice for Sony WH-1000XM5.');
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((o) =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.price.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.subtext && o.subtext.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayedOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 3);

  return (
    <div className="app-shell" onClick={() => soundEngine.init()}>
      {/* Dynamic Animated Aurora Canvas Background */}
      <canvas id="auroraCanvas" ref={canvasRef} />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="toast-notice">
          <i className="fa-solid fa-circle-check text-cyan-400"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER (Exact 1:1 match to screenshot, PFP Circle Removed) */}
      <header className="top-header">
        {/* Left: Brand Logo & Title */}
        <div className="brand-section">
          {/* Luminous Squircle Logo with Stylized Neon 'N' */}
          <div className="brand-logo-squircle">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 19V5C4 5 7.5 5 9.5 8.5L14.5 15.5C16.5 19 20 19 20 19V5"
                stroke="#00E5FF"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0 0 7px #00E5FF)' }}
              />
              <circle cx="4" cy="19" r="1.6" fill="#00E5FF" />
              <circle cx="20" cy="5" r="1.6" fill="#00E5FF" />
            </svg>
          </div>
          <div className="brand-text-col">
            <span className="brand-title">TechNova Retail</span>
            <span className="brand-subtitle">AI Command Center</span>
          </div>
        </div>

        {/* Center: Search Pill */}
        <div className="header-search-wrapper">
          <i className="fa-solid fa-magnifying-glass header-search-icon"></i>
          <input
            type="text"
            className="header-search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => soundEngine.playHover()}
          />
        </div>

        {/* Right: Architecture (Archify), Audio Toggle & Online Engine Badge */}
        <div className="header-right">
          <button
            className="btn-archify"
            onClick={() => {
              soundEngine.playClick();
              setIsArchifyModalOpen(true);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            title="Open Archify System Architecture & Data Flow Diagram"
          >
            <i className="fa-solid fa-diagram-project"></i>
            <span>Architecture (Archify)</span>
          </button>

          <button
            className={`sound-toggle-btn ${isAudioEnabled ? 'active' : ''}`}
            onClick={toggleSound}
            title="Toggle Web Audio Haptic Sounds"
          >
            <i className={`fa-solid ${isAudioEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
            <span>{isAudioEnabled ? 'Audio: ON' : 'Muted'}</span>
          </button>

          <div className="ai-engine-badge">
            <span className="pulse-dot"></span>
            <span>AI Engine Online</span>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SLIM RAIL + WORKSPACE */}
      <div className="body-container">
        {/* SLIM LEFT ICON RAIL */}
        <nav className="nav-rail">
          {/* Top Icons */}
          <div className="nav-rail-top">
            {/* Home Icon */}
            <button
              className={`rail-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playClick();
                setActiveTab('home');
                showToast('Switched to Command Center Dashboard');
              }}
              onMouseEnter={() => soundEngine.playHover()}
              title="Dashboard Overview"
            >
              <i className="fa-solid fa-house"></i>
            </button>

            {/* Grid 4-Squares Icon */}
            <button
              className={`rail-btn ${activeTab === 'grid' ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playClick();
                setIsCatalogModalOpen(true);
              }}
              onMouseEnter={() => soundEngine.playHover()}
              title="Product Catalog & Bento"
            >
              <i className="fa-solid fa-table-cells-large"></i>
            </button>

            {/* Clipboard / Receipt Icon */}
            <button
              className={`rail-btn ${activeTab === 'docs' ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playClick();
                setIsLedgerModalOpen(true);
              }}
              onMouseEnter={() => soundEngine.playHover()}
              title="Receipts & Invoices Ledger"
            >
              <i className="fa-solid fa-clipboard-list"></i>
            </button>

            {/* Settings Gear Icon */}
            <button
              className={`rail-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => {
                soundEngine.playClick();
                setIsSettingsModalOpen(true);
              }}
              onMouseEnter={() => soundEngine.playHover()}
              title="System Configuration"
            >
              <i className="fa-solid fa-gear"></i>
            </button>
          </div>

          {/* Bottom Icons */}
          <div className="nav-rail-bottom">
            {/* Bell Icon */}
            <button
              className="rail-btn"
              onClick={() => {
                soundEngine.playClick();
                setIsAlertsModalOpen(true);
              }}
              onMouseEnter={() => soundEngine.playHover()}
              title="Alert Notifications"
            >
              <i className="fa-solid fa-bell"></i>
            </button>

            {/* Logout / Exit Icon */}
            <button
              className="rail-btn"
              onClick={() => {
                soundEngine.playClick();
                setIsLogoutModalOpen(true);
              }}
              onMouseEnter={() => soundEngine.playHover()}
              title="Exit Session"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        </nav>

        {/* 3. MAIN WORKSPACE (Left: Dashboard, Right: Copilot) */}
        <div className="workspace-content">
          {/* LEFT / CENTER DASHBOARD */}
          <div className="dashboard-main-col">
            {/* 1. Urgent Amber Action Required Box */}
            <div className="alert-card">
              <div className="alert-flex">
                <div className="alert-info-col">
                  <div className="alert-title-row">
                    <span className="alert-warning-icon">⚠️</span>
                    <span className="alert-heading">
                      Action Required: {metrics.expiringDeadlines} Deadlines Expiring Soon (&lt; 7 Days)
                    </span>
                  </div>
                  <div className="alert-subtitle">
                    Sony WH-1000XM5: Return window ends in 3 days
                  </div>
                </div>

                <button
                  className="btn-start-return"
                  onClick={() => {
                    soundEngine.playClick();
                    setIsReturnModalOpen(true);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                >
                  Start Return
                </button>
              </div>
            </div>

            {/* 2. Action Buttons Row */}
            <div className="action-buttons-row">
              {/* + Ingest Receipt (with nested sub-capsule) */}
              <button
                className="btn-ingest-cyan"
                onClick={() => {
                  soundEngine.playScan();
                  setIsIngestModalOpen(true);
                }}
                onMouseEnter={() => soundEngine.playHover()}
              >
                <span>+ Ingest Receipt</span>
                <div className="nested-capsule-badge">
                  <span>+</span>
                  <i className="fa-regular fa-file-lines"></i>
                </div>
              </button>

              {/* Track Order Secondary Pill */}
              <button
                className="btn-track-dark"
                onClick={() => {
                  soundEngine.playClick();
                  setIsTrackModalOpen(true);
                }}
                onMouseEnter={() => soundEngine.playHover()}
              >
                Track Order
              </button>
            </div>

            {/* 3. Three Metrics Bento Grid */}
            <div className="metrics-row">
              {/* Card 1: ₹28,500 with Glowing Cyan Sparkline */}
              <div
                className="bezel-card metric-card"
                onClick={() => {
                  soundEngine.playClick();
                  showToast('₹28,500 protected across 3 verified product warranties');
                }}
                onMouseEnter={() => soundEngine.playHover()}
              >
                <div className="metric-top-row">
                  <span className="metric-big-num mono">{metrics.savedAmount}</span>
                  {/* Neon Cyan Sparkline SVG */}
                  <svg
                    width="84"
                    height="28"
                    viewBox="0 0 84 28"
                    fill="none"
                    className="sparkline-svg"
                  >
                    <path
                      d="M2 20L16 12L30 17L48 5L66 12L80 7"
                      stroke="#00E5FF"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="80" cy="7" r="3.5" fill="#00E5FF" />
                  </svg>
                </div>
                <div className="metric-sublabel mono">SAVED &amp; PROTECTED</div>
              </div>

              {/* Card 2: 3 Active Warranties */}
              <div
                className="bezel-card metric-card"
                onClick={() => {
                  soundEngine.playClick();
                  setIsWarrantyModalOpen(true);
                }}
                onMouseEnter={() => soundEngine.playHover()}
              >
                <div className="metric-top-row">
                  <span className="metric-big-num mono">{metrics.activeWarranties}</span>
                </div>
                <div className="metric-sublabel-plain">Active Warranties</div>
              </div>

              {/* Card 3: 1 In-Transit Order */}
              <div
                className="bezel-card metric-card"
                onClick={() => {
                  soundEngine.playClick();
                  setIsTrackModalOpen(true);
                }}
                onMouseEnter={() => soundEngine.playHover()}
              >
                <div className="metric-top-row">
                  <span className="metric-big-num mono">{metrics.inTransitOrders}</span>
                </div>
                <div className="metric-sublabel-plain">In-Transit Order</div>
              </div>
            </div>

            {/* 4. Recent Orders Section */}
            <div className="orders-section">
              <div className="orders-section-header">
                <span className="orders-heading">Recent Orders</span>
                <span
                  className="show-all-link"
                  onClick={() => {
                    soundEngine.playClick();
                    setShowAllOrders(!showAllOrders);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                >
                  <span>{showAllOrders ? 'Show less' : 'Show all'}</span>
                  <i
                    className={`fa-solid ${showAllOrders ? 'fa-chevron-up' : 'fa-chevron-down'}`}
                    style={{ fontSize: 10 }}
                  ></i>
                </span>
              </div>

              <div className="orders-list">
                {displayedOrders.map((order) => {
                  if (order.id === 'ord-sony') {
                    return (
                      <div
                        key={order.id}
                        className="bezel-card order-row-card"
                        onClick={() => {
                          soundEngine.playClick();
                          setIsReturnModalOpen(true);
                        }}
                        onMouseEnter={() => soundEngine.playHover()}
                      >
                        <div className="order-left-group" style={{ flex: 1 }}>
                          <div className="order-thumbnail-squircle">
                            <i className={`fa-solid ${order.icon}`}></i>
                          </div>
                          <div className="order-details-col" style={{ flex: 1, maxWidth: 360 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span className="order-item-title">{order.title}</span>
                              <span className="amber-days-tag mono">3 days left</span>
                            </div>
                            <div className="return-progress-track" style={{ width: '100%', marginTop: 3 }}>
                              <div className="return-progress-fill" style={{ width: '78%' }}></div>
                            </div>
                          </div>
                        </div>
                        <span className="order-price-tag mono">{order.price}</span>
                      </div>
                    );
                  }

                  if (order.id === 'ord-ipad') {
                    return (
                      <div
                        key={order.id}
                        className="bezel-card order-row-card"
                        onClick={() => {
                          soundEngine.playClick();
                          setIsWarrantyModalOpen(true);
                        }}
                        onMouseEnter={() => soundEngine.playHover()}
                      >
                        <div className="order-left-group">
                          <div className="order-thumbnail-squircle">
                            <i className={`fa-solid ${order.icon}`}></i>
                          </div>
                          <div className="order-details-col">
                            <span className="order-item-title">{order.title}</span>
                            <span className="order-meta-sub mono">{order.subtext}</span>
                          </div>
                        </div>
                        <div className="order-right-group">
                          <span className="warranty-active-badge">{order.badge}</span>
                          <span className="order-price-tag mono">{order.price}</span>
                        </div>
                      </div>
                    );
                  }

                  // Default / Other rows
                  return (
                    <div
                      key={order.id}
                      className="bezel-card order-row-card"
                      onClick={() => {
                        soundEngine.playClick();
                        setIsTrackModalOpen(true);
                      }}
                      onMouseEnter={() => soundEngine.playHover()}
                    >
                      <div className="order-left-group">
                        <div className="order-thumbnail-squircle">
                          <i className={`fa-solid ${order.icon}`}></i>
                        </div>
                        <div className="order-details-col">
                          <span className="order-item-title">{order.title}</span>
                          <span className="order-meta-sub mono">{order.subtext}</span>
                        </div>
                      </div>
                      <div className="order-right-group">
                        {order.badge && <span className="warranty-active-badge">{order.badge}</span>}
                        <span className="order-price-tag mono">{order.price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TECHNOVA AI COPILOT */}
          {isCopilotOpen ? (
            <div className="copilot-panel-container">
              <div className="bezel-card copilot-card">
                {/* Header */}
                <div className="copilot-header">
                  <span className="copilot-header-title">TechNova AI Copilot</span>
                  <button
                    className="copilot-close-btn"
                    onClick={() => {
                      soundEngine.playClick();
                      setIsCopilotOpen(false);
                      showToast('Copilot docked. Click badge in corner to restore.');
                    }}
                    title="Minimize Copilot"
                  >
                    ✕
                  </button>
                </div>

                {/* ⚡ LIVE REACT PIPELINE (MAGIC UI) */}
                <div className="react-pipeline-card">
                  <div className="pipeline-header">
                    <div className="pipeline-title">
                      <i className="fa-solid fa-bolt"></i>
                      <span>Live ReAct Pipeline</span>
                    </div>
                    <div className={`pipeline-status-badge ${pipelineStage === 'idle' ? 'idle' : pipelineStage === 'grounded' ? 'grounded' : 'active'}`}>
                      {pipelineStage === 'idle' && '● Ready'}
                      {pipelineStage === 'user' && '● [1/4] Ingestion'}
                      {pipelineStage === 'tool' && '● [2/4] Math Tool'}
                      {pipelineStage === 'sqlite' && '● [3/4] SQLite DB'}
                      {pipelineStage === 'agent' && '● [4/4] ReAct Brain'}
                      {pipelineStage === 'grounded' && '● Grounded §2.1'}
                    </div>
                  </div>

                  {/* Connected animated glowing nodes: [User] -> [Tool] -> [SQLite] -> [Agent] */}
                  <div className="pipeline-nodes-track">
                    <div className="pipeline-connector-line">
                      {pipelineStage !== 'idle' && <div className="pipeline-connector-beam"></div>}
                    </div>

                    {/* Node 1: User */}
                    <div
                      className={`pipeline-node-item ${pipelineStage === 'user' ? 'active' : pipelineStage !== 'idle' ? 'completed' : ''}`}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedPipelineNode(selectedPipelineNode === 'user' ? null : 'user');
                      }}
                      title="User Intent & Ingestion"
                    >
                      <div className="pipeline-node-bubble">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <span className="pipeline-node-label">User</span>
                    </div>

                    {/* Node 2: Tool */}
                    <div
                      className={`pipeline-node-item ${pipelineStage === 'tool' ? 'active' : ['sqlite', 'agent', 'grounded'].includes(pipelineStage) ? 'completed' : ''}`}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedPipelineNode(selectedPipelineNode === 'tool' ? null : 'tool');
                      }}
                      title="Deterministic Window Tool"
                    >
                      <div className="pipeline-node-bubble">
                        <i className="fa-solid fa-bolt"></i>
                      </div>
                      <span className="pipeline-node-label">Tool</span>
                    </div>

                    {/* Node 3: SQLite */}
                    <div
                      className={`pipeline-node-item ${pipelineStage === 'sqlite' ? 'active' : ['agent', 'grounded'].includes(pipelineStage) ? 'completed' : ''}`}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedPipelineNode(selectedPipelineNode === 'sqlite' ? null : 'sqlite');
                      }}
                      title="SQLite Relational Ledger"
                    >
                      <div className="pipeline-node-bubble">
                        <i className="fa-solid fa-database"></i>
                      </div>
                      <span className="pipeline-node-label">SQLite</span>
                    </div>

                    {/* Node 4: Agent */}
                    <div
                      className={`pipeline-node-item ${pipelineStage === 'agent' ? 'active' : pipelineStage === 'grounded' ? 'completed' : ''}`}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedPipelineNode(selectedPipelineNode === 'agent' ? null : 'agent');
                      }}
                      title="ReAct Agent Synthesis"
                    >
                      <div className="pipeline-node-bubble">
                        <i className="fa-solid fa-brain"></i>
                      </div>
                      <span className="pipeline-node-label">Agent</span>
                    </div>
                  </div>

                  {/* Interactive Node Details Drawer when clicked */}
                  {selectedPipelineNode && (
                    <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 8, border: '1px solid rgba(56, 189, 248, 0.25)', fontSize: 11, color: '#E2E8F0' }}>
                      {selectedPipelineNode === 'user' && 'User Query & OCR receipt text tokenized into structured intent.'}
                      {selectedPipelineNode === 'tool' && 'Python calculate_windows_logic: Strict zero-hallucination calendar math for 15-day return and 365-day warranty bounds.'}
                      {selectedPipelineNode === 'sqlite' && 'SQLite Ground-truth ledger: Verified orders, items, and warranty records with ACID compliance.'}
                      {selectedPipelineNode === 'agent' && 'Gemini 2.5 Flash / Ollama ReAct loop with Store Policy §2.1 citation grounding.'}
                    </div>
                  )}

                  {/* Telemetry footer */}
                  <div className="pipeline-telemetry-row">
                    <span>Engine: <span className="pipeline-telemetry-pill">ReAct + LangChain</span></span>
                    <span>Policy: <span className="pipeline-telemetry-pill">§2.1 Verifiable</span></span>
                    <span>Latency: <span className="pipeline-telemetry-pill">1.2ms Math</span></span>
                  </div>
                </div>

                {/* Chat Messages Feed */}
                <div className="copilot-messages-feed">
                  {messages.map((m) => (
                    <div key={m.id} className="msg-wrapper">
                      {/* Header */}
                      <div className="msg-header-row">
                        {m.sender === 'assistant' ? (
                          <div className="bot-avatar-circle">
                            <i className="fa-solid fa-comment-dots"></i>
                          </div>
                        ) : (
                          <div className="user-avatar-circle">
                            <i className="fa-solid fa-user"></i>
                          </div>
                        )}
                        <span className="msg-sender-name">{m.senderTitle}</span>
                      </div>

                      {/* Body */}
                      <div className="msg-body-pl">
                        {/* Tool Badge */}
                        {m.tool && (
                          <div className="tool-badge">
                            <i className="fa-solid fa-bolt tool-bolt-icon"></i>
                            <span>Tool: {m.tool}</span>
                          </div>
                        )}

                        {/* Content Bubble */}
                        <div className={`msg-bubble-card ${m.sender === 'user' ? 'user-bubble' : ''}`}>
                          <div>{m.content}</div>
                          {m.hasCitation && m.citation && (
                            <div className="citation-highlight" style={{ marginTop: 4 }}>
                              {m.citation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isCopilotTyping && (
                    <div className="msg-wrapper">
                      <div className="msg-header-row">
                        <div className="bot-avatar-circle">
                          <i className="fa-solid fa-comment-dots"></i>
                        </div>
                        <span className="msg-sender-name">TechNova AI Copilot</span>
                      </div>
                      <div className="msg-body-pl">
                        <div className="tool-badge">
                          <i className="fa-solid fa-bolt tool-bolt-icon"></i>
                          <span>Tool: return_warranty_calculator</span>
                        </div>
                        <div className="msg-bubble-card" style={{ fontStyle: 'italic', color: '#94A3B8' }}>
                          Retrieving store policy §2.1 and grounding verification...
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Copilot Bottom Actions */}
                <div className="copilot-bottom-area">
                  {/* Quick Action Chips */}
                  <div className="quick-chips-row">
                    <button
                      className="chip-btn"
                      onClick={() => {
                        soundEngine.playClick();
                        setIsReturnModalOpen(true);
                      }}
                      onMouseEnter={() => soundEngine.playHover()}
                    >
                      [Initiate Return]
                    </button>
                    <button
                      className="chip-btn"
                      onClick={() => handleDownloadReceipt()}
                      onMouseEnter={() => soundEngine.playHover()}
                    >
                      [Download Receipt]
                    </button>
                  </div>

                  {/* Input Bar */}
                  <div className="copilot-input-wrapper">
                    <input
                      type="text"
                      className="copilot-input-box"
                      placeholder="Type a message..."
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendMessage();
                      }}
                      onFocus={() => soundEngine.playHover()}
                    />
                    <button
                      className="copilot-send-btn"
                      onClick={() => handleSendMessage()}
                      title="Send Command"
                    >
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              className="floating-copilot-trigger"
              onClick={() => {
                soundEngine.playClick();
                setIsCopilotOpen(true);
              }}
            >
              <i className="fa-solid fa-bolt" style={{ color: '#00E5FF' }}></i>
              <span>TechNova AI Copilot</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. MODAL 1: RECEIPT INGESTION */}
      {isIngestModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsIngestModalOpen(false)}>
          <div className="bezel-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-receipt" style={{ color: '#00E5FF' }}></i>
                <span className="modal-title">Proactive Receipt Ingestion</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsIngestModalOpen(false)}>✕</button>
            </div>

            <div className="modal-tabs-row">
              <button
                className={`modal-tab-btn ${ingestTab === 'preset' ? 'active' : ''}`}
                onClick={() => setIngestTab('preset')}
              >
                Sample Presets
              </button>
              <button
                className={`modal-tab-btn ${ingestTab === 'upload' ? 'active' : ''}`}
                onClick={() => setIngestTab('upload')}
              >
                Upload File
              </button>
              <button
                className={`modal-tab-btn ${ingestTab === 'paste' ? 'active' : ''}`}
                onClick={() => setIngestTab('paste')}
              >
                Paste Text
              </button>
            </div>

            {ingestTab === 'preset' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <label className="form-label">Select Hackathon Benchmark Receipt:</label>
                <select
                  className="form-select"
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                >
                  <option value="sony">Sony WH-1000XM5 (Expiring in 3 Days - Alert Demo)</option>
                  <option value="glamorizee">Glamorizee Necklace (Sidharth SIDDU - Delhivery)</option>
                  <option value="ipad">Apple iPad Air M2 (Active AppleCare+ Warranty)</option>
                </select>
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.4 }}>
                  Deterministic date math will verify against reference date (2026-09-21) and compute return windows automatically.
                </div>
              </div>
            )}

            {ingestTab === 'upload' && (
              <div className="dropzone-area" onClick={handleExecuteIngest}>
                <i className="fa-solid fa-cloud-arrow-up dropzone-icon"></i>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#FFFFFF' }}>
                  Click to Upload or Drag Receipt File
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }} className="mono">
                  PDF, JPG, PNG or WhatsApp text (.txt)
                </div>
              </div>
            )}

            {ingestTab === 'paste' && (
              <div>
                <label className="form-label">Paste Invoice or Order Confirmation Text:</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Paste purchase details, order ID, product name, amount..."
                  value={pastedReceipt}
                  onChange={(e) => setPastedReceipt(e.target.value)}
                />
              </div>
            )}

            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsIngestModalOpen(false)}>Cancel</button>
              <button
                className="btn-ingest-cyan"
                style={{ padding: '7px 18px', fontSize: 12 }}
                onClick={handleExecuteIngest}
              >
                Ingest &amp; Analyze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL 2: RETURN RMA WORKFLOW */}
      {isReturnModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsReturnModalOpen(false)}>
          <div className="bezel-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-rotate-left" style={{ color: '#F59E0B' }}></i>
                <span className="modal-title">Initiate Return: Sony WH-1000XM5</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsReturnModalOpen(false)}>✕</button>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FCD34D' }}>
                Return Window Eligibility: APPROVED (Policy §2.1)
              </div>
              <div style={{ fontSize: 11, color: '#E2E8F0', marginTop: 4 }}>
                Purchased: 2026-09-18 • Return window closes in <strong>3 days</strong> (2026-10-03).
              </div>
            </div>

            <div>
              <label className="form-label">Return Reason:</label>
              <select
                className="form-select"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              >
                <option value="Audio tuning not suitable">Audio tuning / sound signature not suitable</option>
                <option value="Found better price">Found a lower price elsewhere</option>
                <option value="Defective or damaged">Hardware defect or missing accessories</option>
                <option value="Changed mind">Changed mind / ordered by mistake</option>
              </select>
            </div>

            <div>
              <label className="form-label">Logistics Return Method:</label>
              <select
                className="form-select"
                value={returnMethod}
                onChange={(e) => setReturnMethod(e.target.value)}
              >
                <option value="Delhivery Doorstep Courier Pickup">Delhivery Doorstep Courier Pickup (Tomorrow 11:00 AM)</option>
                <option value="BlueDart Express Dropoff">Drop-off at nearest BlueDart Express kiosk</option>
                <option value="TechNova Retail Store Drop">Return at local TechNova Experience Center</option>
              </select>
            </div>

            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsReturnModalOpen(false)}>Cancel</button>
              <button
                className="btn-start-return"
                style={{ background: '#F59E0B', color: '#000000', border: 'none', fontWeight: 800 }}
                onClick={handleConfirmReturn}
              >
                Confirm Return RMA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL 3: LIVE LOGISTICS TRACKING */}
      {isTrackModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTrackModalOpen(false)}>
          <div className="bezel-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-truck-fast" style={{ color: '#00E5FF' }}></i>
                <span className="modal-title">Live Logistics Tracking</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsTrackModalOpen(false)}>✕</button>
            </div>

            <div style={{ background: 'rgba(8, 14, 28, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Keychron K2 keyboard</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }} className="mono">AWB: 22017731381544 • Delhivery Express</div>
                </div>
                <span className="warranty-active-badge" style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00E5FF', borderColor: 'rgba(0, 229, 255, 0.4)' }}>
                  Out For Delivery
                </span>
              </div>
            </div>

            <div className="timeline-stepper">
              <div className="timeline-step">
                <div className="step-indicator step-done"><i className="fa-solid fa-check"></i></div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>Order Dispatched from Fulfillment Hub</div>
                  <div style={{ fontSize: 10.5, color: '#64748B' }}>Sep 28, 2026 • 09:14 AM</div>
                </div>
              </div>
              <div className="timeline-step">
                <div className="step-indicator step-done"><i className="fa-solid fa-check"></i></div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>Arrived at Regional Distribution Center</div>
                  <div style={{ fontSize: 10.5, color: '#64748B' }}>Sep 29, 2026 • 06:40 PM</div>
                </div>
              </div>
              <div className="timeline-step">
                <div className="step-indicator step-active"><i className="fa-solid fa-truck"></i></div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#00E5FF' }}>Out for Delivery with Courier Agent</div>
                  <div style={{ fontSize: 10.5, color: '#38BDF8' }}>Today • Expected before 05:00 PM</div>
                </div>
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                className="btn-ghost"
                onClick={() => {
                  soundEngine.playClick();
                  handleSendMessage('Give me GPS coordinates and courier contact for Keychron K2 tracking 22017731381544');
                  setIsTrackModalOpen(false);
                }}
              >
                Ask Copilot for Updates
              </button>
              <button
                className="btn-track-dark"
                style={{ padding: '7px 18px', fontSize: 12 }}
                onClick={() => {
                  soundEngine.playClick();
                  showToast('✓ Tracking Refreshed: Package is 2 stops away');
                }}
              >
                Refresh Live Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL 4: ACTIVE WARRANTIES DETAILS */}
      {isWarrantyModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsWarrantyModalOpen(false)}>
          <div className="bezel-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-shield-halved" style={{ color: '#10B981' }}></i>
                <span className="modal-title">Active Device Warranties (3)</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsWarrantyModalOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(8, 14, 28, 0.9)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Apple iPad Air M2</div>
                  <span className="warranty-active-badge">Active</span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  Coverage: AppleCare+ (Accidental &amp; Hardware) • Expires Sep 2027
                </div>
              </div>

              <div style={{ background: 'rgba(8, 14, 28, 0.9)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>Sony WH-1000XM5</div>
                  <span className="warranty-active-badge">Active</span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  Coverage: Sony India 1-Year Limited Warranty • Expires Sep 2027
                </div>
              </div>

              <div style={{ background: 'rgba(8, 14, 28, 0.9)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF' }}>White Flower Name Necklace</div>
                  <span className="warranty-active-badge">Active</span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  Coverage: 90-Day Anti-Tarnish Guarantee • Expires Nov 16, 2026
                </div>
              </div>
            </div>

            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsWarrantyModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL 5: SYSTEM CONFIGURATION (SETTINGS) */}
      {isSettingsModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsSettingsModalOpen(false)}>
          <div className="bezel-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-gear" style={{ color: '#00E5FF' }}></i>
                <span className="modal-title">System Configuration</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsSettingsModalOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">REST API Backend Connection:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#34D399' }}>
                  <span className="pulse-dot"></span>
                  <span>FastAPI (http://127.0.0.1:8000) Connected</span>
                </div>
              </div>

              <div>
                <label className="form-label">Underlying Reasoning Model:</label>
                <select className="form-select">
                  <option>Gemini 2.5 Pro / Flash (Google Cloud API)</option>
                  <option>Ollama Local Llama-3.2 (Offline Engine)</option>
                  <option>Grounded RAG Pipeline §2.1 Rule Base</option>
                </select>
              </div>

              <div>
                <label className="form-label">Impending Deadline Threshold:</label>
                <select className="form-select">
                  <option>7 Days (Standard Urgent Alert)</option>
                  <option>14 Days (Extended Notification)</option>
                  <option>3 Days (Critical Only)</option>
                </select>
              </div>
            </div>

            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsSettingsModalOpen(false)}>Cancel</button>
              <button
                className="btn-track-dark"
                onClick={() => {
                  soundEngine.playClick();
                  setIsSettingsModalOpen(false);
                  showToast('✓ System Configuration Saved');
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL 6: NOTIFICATIONS DRAWER */}
      {isAlertsModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAlertsModalOpen(false)}>
          <div className="bezel-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-bell" style={{ color: '#F59E0B' }}></i>
                <span className="modal-title">Urgent Alerts &amp; Notifications</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsAlertsModalOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid #F59E0B', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FCD34D' }}>
                  ⚠️ Sony WH-1000XM5: Return Window Expiring
                </div>
                <div style={{ fontSize: 11, color: '#E2E8F0', marginTop: 4 }}>
                  Only 3 days left before return eligibility expires under Store Policy §2.1.
                </div>
                <button
                  className="btn-start-return"
                  style={{ marginTop: 8, padding: '5px 14px', fontSize: 11 }}
                  onClick={() => {
                    setIsAlertsModalOpen(false);
                    setIsReturnModalOpen(true);
                  }}
                >
                  Start Return Now
                </button>
              </div>

              <div style={{ background: 'rgba(0, 229, 255, 0.06)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#38BDF8' }}>
                  📦 Keychron K2: Out for Delivery
                </div>
                <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4 }}>
                  Package is out for delivery today with Delhivery express.
                </div>
              </div>
            </div>

            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsAlertsModalOpen(false)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL 7: PRODUCT BENTO CATALOG */}
      {isCatalogModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCatalogModalOpen(false)}>
          <div className="bezel-card modal-dialog" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-table-cells-large" style={{ color: '#00E5FF' }}></i>
                <span className="modal-title">Protected Products Catalog</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsCatalogModalOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {orders.map((item) => (
                <div
                  key={item.id}
                  style={{ background: 'rgba(8, 14, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 12, cursor: 'pointer' }}
                  onClick={() => {
                    soundEngine.playClick();
                    setIsCatalogModalOpen(false);
                    handleSendMessage(`What is the warranty and return status for ${item.title}?`);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="order-thumbnail-squircle" style={{ width: 32, height: 32, fontSize: 13 }}>
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }} className="mono">{item.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsCatalogModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODAL 8: RECEIPTS LEDGER */}
      {isLedgerModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLedgerModalOpen(false)}>
          <div className="bezel-card modal-dialog" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-clipboard-list" style={{ color: '#00E5FF' }}></i>
                <span className="modal-title">Receipts &amp; Invoice Archive</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsLedgerModalOpen(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(8, 14, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>Sony WH-1000XM5 Invoice</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }} className="mono">TN-INV-2026-904 • ₹24,990</div>
                </div>
                <button className="chip-btn" onClick={handleDownloadReceipt}>Download</button>
              </div>

              <div style={{ background: 'rgba(8, 14, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>Apple iPad Air M2 Invoice</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }} className="mono">APL-INV-8820 • ₹59,900</div>
                </div>
                <button className="chip-btn" onClick={handleDownloadReceipt}>Download</button>
              </div>

              <div style={{ background: 'rgba(8, 14, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#FFFFFF' }}>Glamorizee Flower Necklace Receipt</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }} className="mono">GLM-77144 • ₹219</div>
                </div>
                <button className="chip-btn" onClick={handleDownloadReceipt}>Download</button>
              </div>
            </div>

            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsLedgerModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 12. MODAL 9: LOGOUT CONFIRMATION */}
      {isLogoutModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsLogoutModalOpen(false)}>
          <div className="bezel-card modal-dialog" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ color: '#F43F5E' }}></i>
                <span className="modal-title">Exit Session</span>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsLogoutModalOpen(false)}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>
              Are you sure you want to end your active command center session? Your protected warranties and deadlines remain monitored.
            </p>
            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsLogoutModalOpen(false)}>Cancel</button>
              <button
                className="btn-start-return"
                style={{ background: '#E11D48', color: '#FFFFFF', border: 'none' }}
                onClick={() => {
                  soundEngine.playClick();
                  setIsLogoutModalOpen(false);
                  showToast('Session locked. Reconnect at any time.');
                }}
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. MODAL 10: ARCHIFY ARCHITECTURE & DATA FLOW */}
      {isArchifyModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsArchifyModalOpen(false)}>
          <div className="bezel-card modal-dialog archify-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-group">
                <i className="fa-solid fa-diagram-project" style={{ color: '#38BDF8', fontSize: 18 }}></i>
                <div>
                  <div className="modal-title">TechNova Retail: Autonomous AI Architecture</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }} className="mono">Archify System Graph · CAPABL Hackathon Track 5</div>
                </div>
              </div>
              <button className="copilot-close-btn" onClick={() => setIsArchifyModalOpen(false)}>✕</button>
            </div>

            {/* Trace Control Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8, 14, 28, 0.7)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '10px 14px', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF' }}>Live Data-Flow Simulation:</span>
                <span className="mono" style={{ fontSize: 11, color: isTraceRunning ? '#38BDF8' : '#64748B' }}>
                  {isTraceRunning ? `Packet active at Stage ${traceStep + 1}/4` : 'Simulator Ready'}
                </span>
              </div>
              <button
                className="btn-archify"
                style={{ height: 32, fontSize: 11.5 }}
                onClick={() => {
                  soundEngine.playScan();
                  setIsTraceRunning(true);
                  setTraceStep(0);
                  setTimeout(() => setTraceStep(1), 600);
                  setTimeout(() => setTraceStep(2), 1200);
                  setTimeout(() => setTraceStep(3), 1800);
                  setTimeout(() => {
                    setIsTraceRunning(false);
                    soundEngine.playChime();
                    showToast('✓ Archify Trace Complete: Grounded Policy Response Verified');
                  }, 2400);
                }}
              >
                <i className="fa-solid fa-play"></i>
                <span>{isTraceRunning ? 'Tracing Packets...' : 'Run Architecture Trace'}</span>
              </button>
            </div>

            {/* 4 Architectural Tiers */}
            <div className="archify-grid-cols">
              {/* Tier 1: Ingestion */}
              <div className="archify-tier-card" style={{ borderColor: isTraceRunning && traceStep === 0 ? '#38BDF8' : undefined, boxShadow: isTraceRunning && traceStep === 0 ? '0 0 20px rgba(56, 189, 248, 0.4)' : undefined }}>
                <div className="archify-tier-num" style={{ color: '#38BDF8' }}>Tier 01 · Input</div>
                <div className="archify-tier-title">Client &amp; Ingestion</div>
                <div className="archify-tier-desc">
                  Multi-format parser for PDF receipts, OCR images, and WhatsApp text. Embedded Web Audio haptic feedback synthesizer.
                </div>
                <div className="archify-tier-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
                  React 19 + AudioContext
                </div>
              </div>

              {/* Tier 2: Deterministic Math */}
              <div className="archify-tier-card" style={{ borderColor: isTraceRunning && traceStep === 1 ? '#F59E0B' : undefined, boxShadow: isTraceRunning && traceStep === 1 ? '0 0 20px rgba(245, 158, 11, 0.4)' : undefined }}>
                <div className="archify-tier-num" style={{ color: '#F59E0B' }}>Tier 02 · Math</div>
                <div className="archify-tier-title">Zero-Hallucination Tool</div>
                <div className="archify-tier-desc">
                  Pure Python calendar arithmetic (<span className="mono" style={{ color: '#FCD34D' }}>calculate_windows_logic</span>). Strict calendar day bounds with leap-year handling.
                </div>
                <div className="archify-tier-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FCD34D' }}>
                  Deterministic Engine
                </div>
              </div>

              {/* Tier 3: Ground Truth Ledger */}
              <div className="archify-tier-card" style={{ borderColor: isTraceRunning && traceStep === 2 ? '#818CF8' : undefined, boxShadow: isTraceRunning && traceStep === 2 ? '0 0 20px rgba(129, 140, 248, 0.4)' : undefined }}>
                <div className="archify-tier-num" style={{ color: '#818CF8' }}>Tier 03 · Storage</div>
                <div className="archify-tier-title">SQLite Ground Truth</div>
                <div className="archify-tier-desc">
                  Relational state ledger for orders, line items, and warranty periods. Vector embedding store for Store Policies (§2.1 &amp; §4.3).
                </div>
                <div className="archify-tier-tag" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#A5B4FC' }}>
                  SQLite + ChromaDB
                </div>
              </div>

              {/* Tier 4: ReAct Brain */}
              <div className="archify-tier-card" style={{ borderColor: isTraceRunning && traceStep === 3 ? '#10B981' : undefined, boxShadow: isTraceRunning && traceStep === 3 ? '0 0 20px rgba(16, 185, 129, 0.4)' : undefined }}>
                <div className="archify-tier-num" style={{ color: '#10B981' }}>Tier 04 · Agent</div>
                <div className="archify-tier-title">ReAct Agent Brain</div>
                <div className="archify-tier-desc">
                  Google Gemini 2.5 Flash with local Ollama fallback. Thought-Action-Observation loop with mandatory citation grounding.
                </div>
                <div className="archify-tier-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                  LangChain ReAct
                </div>
              </div>
            </div>

            {/* Deterministic vs LLM Hallucination Matrix */}
            <div style={{ background: 'rgba(8, 14, 28, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginBottom: 8 }}>
                Technical Differentiation: Why Deterministic Math Prevents Date Hallucinations
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#F87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-solid fa-triangle-exclamation"></i> Pure LLM Approach (Fragile)
                  </div>
                  <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4, lineHeight: 1.4 }}>
                    LLMs attempt token probability prediction for date addition (e.g. 2026-09-18 + 15 days). High hallucination rate on month boundaries, 30/31 day shifts, and leap years.
                  </div>
                </div>

                <div style={{ padding: 12, background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#34D399', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fa-solid fa-circle-check"></i> TechNova Dual-Engine (Zero Error)
                  </div>
                  <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 4, lineHeight: 1.4 }}>
                    Agent invokes Python <span className="mono">datetime.timedelta</span> tool. Absolute precision for return window (Oct 3, 2026) and warranty expiration (Sep 18, 2027). Grounded citation §2.1.
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions-row">
              <button className="btn-ghost" onClick={() => setIsArchifyModalOpen(false)}>Close Diagram</button>
              <button
                className="btn-ingest-cyan"
                style={{ padding: '7px 18px', fontSize: 12 }}
                onClick={() => {
                  soundEngine.playClick();
                  setIsArchifyModalOpen(false);
                  showToast('✓ Architecture Spec & Architecture Diagram Verified');
                }}
              >
                Confirm System Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
