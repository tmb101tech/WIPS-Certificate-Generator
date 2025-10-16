"use client"

import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Award, Download, ArrowLeft, Sparkles, Loader2, Check } from "lucide-react";

export default function Home() {
  // component state
  const [name, setName] = useState("");
  const [showCert, setShowCert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  // pinch-to-zoom state and refs for touch gestures (mobile)
  const [certScale, setCertScale] = useState(1);
  const pinchRef = useRef({ initialDistance: 0, initialScale: 1 });

  // handler: generate certificate (simulated)
  const handleGenerate = () => {
    if (!name.trim()) return alert("Please enter your full name");
    setIsLoading(true);

    // simulate generation -> show success tick briefly -> then show certificate
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setShowCert(true);
      }, 1400);
    }, 1600);
  };

  // handler: render certificate element to PDF and download
  const handleDownload = async () => {
    const element = certRef.current;
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${name}-certificate.pdf`);
  };

  // handler: submit on Enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  // compute dynamic font size for name based on length and screen size
  const computeNameFontSize = (text: string) => {
    const len = text.trim().length;
    // Detect mobile (width <= 600px)
    let isMobile = false;
    if (typeof window !== 'undefined') {
      isMobile = window.innerWidth <= 600 || window.matchMedia('(max-width: 600px)').matches;
    }
    // Lower max font size on mobile
    const baseMax = isMobile ? 22 : 34; // px
    const baseMin = 12; // px
    if (!len) return `${baseMax}px`;

    if (len <= 10) return `clamp(16px, 3vw, ${baseMax}px)`;

    // reduce max size progressively for longer names
    const extra = len - 10;
    // each extra character reduces the max by ~0.9px, but clamp to baseMin
    const reducedMax = Math.max(baseMin, Math.round(baseMax - extra * 0.9));
    return `clamp(${baseMin}px, calc(13px + ${Math.max(0.7, 2.5 - extra * 0.06)}vw), ${reducedMax}px)`;
  };

  // pinch-to-zoom handlers for mobile preview
  useEffect(() => {
    const el = certRef.current;
    if (!el) return;

    const getDistance = (t1: Touch, t2: Touch) => {
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      return Math.hypot(dx, dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current.initialDistance = getDistance(e.touches[0], e.touches[1]);
        pinchRef.current.initialScale = certRef.current ? certScale : 1;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = getDistance(e.touches[0], e.touches[1]);
        const scale = (distance / pinchRef.current.initialDistance) * pinchRef.current.initialScale;
        // clamp scale between 1 and 3
        const clamped = Math.min(3, Math.max(1, scale));
        setCertScale(clamped);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      // when fingers lifted, if scale < 1, reset to 1
      setCertScale((s) => Math.max(1, Math.min(3, s)));
    };

    // prefer passive: false so we can preventDefault during pinch
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart as any);
      el.removeEventListener('touchmove', onTouchMove as any);
      el.removeEventListener('touchend', onTouchEnd as any);
    };
  }, [certScale]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJWMzRoLTJ6bTAtNGgydjJoLTJ2LTJ6bTAtNHYyaC0ydi0yaDF6bTAtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

  {/* Landing / form: hidden while loading/success/certificate shown */}
  {!showCert && !isLoading && !isSuccess && (
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Award className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                WORLD INNOVATORS
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-3">
                PROFESSIONALS
              </h2>
              <div className="flex items-center justify-center gap-2 text-cyan-100">
                <p className="text-sm md:text-base font-medium">
                  Get Your Participation Certificate Here
                </p>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="mb-6">
                <label className="block text-white/90 text-sm font-semibold mb-3 tracking-wide">
                  FULL NAME
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full p-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all duration-300"
                />
              </div>

              <button
                onClick={handleGenerate}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                Generate Certificate
              </button>

              <p className="text-white/50 text-xs text-center mt-6">
                Celebrate your participation in the program
              </p>
            </div>
          </div>
        </div>
      )}

  {/* Loading / success card: shows spinner or check + message */}
  {(isLoading || isSuccess) && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-6">
                  {!isSuccess ? (
                    <Loader2 className="w-16 h-16 text-white animate-spin" />
                  ) : (
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/80">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {!isSuccess ? 'Generating Your Certificate' : 'Certificate generated'}
            </h3>
            <p className="text-cyan-300 text-sm md:text-base mb-2">
              {!isSuccess ? 'Crafting your personalized certificate...' : 'Ready — preparing your download.'}
            </p>
            <div className="flex items-center justify-center gap-1 mt-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

  {/* Certificate preview, user can download as pdf or go back to genrate another. */}
  {showCert && (
        <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">
          <div className="mb-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Your Certificate is Ready!
            </h2>
            <p className="text-cyan-300 text-sm md:text-base">
              Download and share your achievement
            </p>
          </div>

          <div
            ref={certRef}
            className="relative w-full max-w-[900px] h-auto aspect-[16/9] bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{ touchAction: 'none', transform: `scale(${certScale})`, transformOrigin: 'center center' }}
          >
            <img
              src="/certificate-template.jpg"
              alt="Certificate Template"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute text-center w-full px-4 flex items-center justify-center"
              style={{
                top: "44%",
                left: "55%",
                transform: "translate(-50%, -50%)",
                color: "#000000",
                fontWeight: 600,
                fontFamily: "'Bookman OldStyle', serif",
                // fontStyle: 'italic',
                textShadow: "0 1px 2px rgba(0,0,0,0.08)",
                letterSpacing: "0.3px",
                padding: '0 12px',
              }}
            >
              <span style={{ maxWidth: '86%', display: 'inline-block', wordBreak: 'break-word', whiteSpace: 'normal', fontSize: computeNameFontSize(name) }}>{name}</span>
            </div>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap justify-center">
            <button
              onClick={handleDownload}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-cyan-500/50 transform hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={() => setShowCert(false)}
              className="bg-white/10 backdrop-blur-sm border-2 border-white/20 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Footer showing my name linked to my portfolio */}
      <div className="w-full flex justify-center mt-10 mb-6">
        <footer className="relative z-20 text-center text-sm text-white/60">

          © 2025{' '}
          <a
            href="https://tmb-space.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 font-semibold"
          >
            Built by TMB
          </a>
        </footer>
      </div>
    </div>
  );
}
