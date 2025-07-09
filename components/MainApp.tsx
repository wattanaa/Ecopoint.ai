import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAppData } from '../hooks/useAppData';
import { type Screen, type Activity, type Reward, type ScanResult, type DetectedObject, type LeaderboardUser, type User } from '../types';
import { TIERS, TIERS_ARRAY } from '../constants';
import { useObjectDetection } from '../hooks/useObjectDetection';
import getEcoTip from '../services/geminiService';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
    Home, Camera, Gift, Star, Recycle, Trophy, LogOut, X, CheckCircle2, Bot, Info, 
    Package, GlassWater, Trash2, UserRound, Save, Check, Crown, BarChart, CupSoda, 
    Trash, Sparkles, ShoppingBag, Coffee, Box, Shirt, Sprout 
} from 'lucide-react';

// Create a map for dynamic reward icons, ensures type safety and fixes module loading errors.
const rewardIconMap: { [key: string]: React.ElementType } = {
    ShoppingBag,
    Coffee,
    Box,
    Shirt,
    Gift,
    Sprout,
};

// Reusable Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors">
                            <X size={24} />
                        </button>
                        <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
                        <div>{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; }> = ({ label, value, icon }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 flex items-center space-x-4">
        <div className="bg-slate-100 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-slate-600 text-sm font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-800">
                {value}
            </p>
        </div>
    </div>
);

const TierProgressBar: React.FC = () => {
    const { currentUser, settings } = useAppData();
    if (!currentUser || !settings) return null;

    const currentTierInfo = TIERS[currentUser.tier];
    const nextTierIndex = TIERS_ARRAY.findIndex(t => t.name === currentTierInfo.name) + 1;
    const nextTierInfo = nextTierIndex < TIERS_ARRAY.length ? TIERS_ARRAY[nextTierIndex] : null;
    
    const currentTierSettings = settings.tiers[currentUser.tier];
    const nextTierSettings = nextTierInfo ? settings.tiers[nextTierInfo.name] : null;

    const progress = nextTierSettings ? Math.max(0, (currentUser.points - currentTierSettings.min) / (nextTierSettings.min - currentTierSettings.min)) * 100 : 100;

    return (
        <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-slate-700 flex items-center">ระดับ: {currentTierInfo.name} <span className={`ml-2 w-4 h-4 rounded-full ${currentTierInfo.class}`}></span></p>
                {nextTierInfo && <p className="text-sm text-slate-500 flex items-center gap-1">ขั้นต่อไป: {nextTierInfo.name} <Sparkles size={14} className="text-amber-500" /></p>}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
                <motion.div
                    className={`h-3 rounded-full ${currentTierInfo.class}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
            <p className="text-right text-sm font-medium text-slate-500 mt-2">
                {currentUser.points.toLocaleString()} / {nextTierSettings ? nextTierSettings.min.toLocaleString() : 'Max'} คะแนน
            </p>
        </div>
    );
};

// ####################
// ### SCREENS      ###
// ####################

const DashboardScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, logout } = useAppData();
    if (!currentUser) return null;

    const totalItems = currentUser.totalBottles + currentUser.totalCups + currentUser.totalGlass;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                 <div>
                     <p className="text-xl md:text-2xl font-bold text-slate-800">สวัสดี, {currentUser.name}</p>
                     <p className="text-slate-500">ยินดีต้อนรับกลับมา!</p>
                </div>
                <div className="flex items-center space-x-1">
                    <motion.button whileHover={{scale: 1.1}} whileTap={{scale:0.9}} onClick={() => onNavigate('profile')} className="p-2.5 text-slate-600 hover:bg-sky-100 hover:text-sky-600 rounded-full transition-colors">
                        <UserRound size={20} />
                    </motion.button>
                    <motion.button whileHover={{scale: 1.1}} whileTap={{scale:0.9}} onClick={logout} className="p-2.5 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
                        <LogOut size={20} />
                    </motion.button>
                </div>
            </div>
            
            <TierProgressBar />

            <div className="grid grid-cols-2 gap-4">
                <StatCard label="คะแนนสะสม" value={currentUser.points.toLocaleString()} icon={<Star size={24} className="text-yellow-500"/>} />
                <StatCard label="ของที่รีไซเคิล" value={totalItems.toLocaleString()} icon={<Recycle size={24} className="text-green-500"/>} />
            </div>

             <div className="grid grid-cols-2 gap-4">
                <QuickActionCard onClick={() => onNavigate('scan')} icon={<Camera size={28} />} label="สแกน" color="sky" />
                <QuickActionCard onClick={() => onNavigate('rewards')} icon={<Gift size={28} />} label="แลกรางวัล" color="violet" />
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
                <h3 className="text-lg font-bold text-slate-800 mb-3 px-2">กิจกรรมล่าสุด</h3>
                <div className="space-y-1">
                    {currentUser.history.length > 0 ? currentUser.history.slice(0, 5).map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                    )) : (
                        <div className="text-center py-10 text-slate-500">
                             <BarChart size={40} className="mx-auto mb-3 text-slate-400" />
                             <p className="font-semibold">ยังไม่มีกิจกรรม</p>
                             <p className="text-sm">เริ่มสแกนเพื่อสะสมคะแนนได้เลย!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScanScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, addActivity, settings } = useAppData();
    const { model, isLoading, detectObjects } = useObjectDetection();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectionHistoryRef = useRef<ScanResult[]>([]);
    const [view, setView] = useState<'idle' | 'scanning' | 'summary'>('idle');
    const [scanResult, setScanResult] = useState<ScanResult>({ bottles: 0, cups: 0, glass: 0 });
    const [predictions, setPredictions] = useState<DetectedObject[]>([]);
    const [summaryData, setSummaryData] = useState<{points: number; tip: string; result: ScanResult} | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const earnedPoints = useMemo(() => {
        if (!settings) return 0;
        return (scanResult.bottles * settings.points.bottle) + 
               (scanResult.cups * settings.points.cup) + 
               (scanResult.glass * settings.points.glass)
    }, [scanResult, settings]);

    const runDetection = useCallback(async () => {
        if (!model || !videoRef.current || videoRef.current.readyState !== 4) {
          return;
        }
    
        try {
          const detected = await detectObjects(videoRef.current);
          const validPredictions = detected.filter(p => {
            const className = p.class.toLowerCase();
            const isRelevant = className.includes('bottle') || className === 'cup' || className.includes('glass');
            return isRelevant && p.score > 0.7;
          });
          setPredictions(validPredictions);
    
          const currentFrameResult: ScanResult = { bottles: 0, cups: 0, glass: 0 };
          validPredictions.forEach(p => {
            const className = p.class.toLowerCase();
            if (className.includes('bottle')) currentFrameResult.bottles++;
            else if (className === 'cup') currentFrameResult.cups++;
            else if (className.includes('glass')) currentFrameResult.glass++;
          });
    
          const history = detectionHistoryRef.current;
          history.push(currentFrameResult);
          if (history.length > 20) history.shift();
    
          if (history.length > 0) {
            const total = history.reduce((acc, curr) => ({
              bottles: acc.bottles + curr.bottles,
              cups: acc.cups + curr.cups,
              glass: acc.glass + curr.glass,
            }), { bottles: 0, cups: 0, glass: 0 });
    
            setScanResult({
              bottles: Math.round(total.bottles / history.length),
              cups: Math.round(total.cups / history.length),
              glass: Math.round(total.glass / history.length),
            });
          }
        } catch (error) {
          console.error("Detection error:", error);
        }
    }, [model, detectObjects]);
    
    useEffect(() => {
        let animationFrameId: number | null = null;
    
        const detectionLoop = async () => {
            await runDetection();
            animationFrameId = requestAnimationFrame(detectionLoop);
        };
    
        if (view === 'scanning') {
            detectionLoop();
        }
    
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [view, runDetection]);

    useEffect(() => {
        if (view === 'scanning' && canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const ctx = canvas.getContext('2d');

            if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

            const videoRect = video.getBoundingClientRect();
            canvas.width = videoRect.width;
            canvas.height = videoRect.height;

            const videoAspectRatio = video.videoWidth / video.videoHeight;
            const canvasAspectRatio = canvas.width / canvas.height;
            let scale = 1;
            let offsetX = 0;
            let offsetY = 0;

            if (videoAspectRatio > canvasAspectRatio) {
                scale = canvas.height / video.videoHeight;
                offsetX = (video.videoWidth * scale - canvas.width) / 2;
            } else {
                scale = canvas.width / video.videoWidth;
                offsetY = (video.videoHeight * scale - canvas.height) / 2;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '16px Kanit, sans-serif';
            ctx.textBaseline = 'top';
            
            predictions.forEach(p => {
                const [x, y, width, height] = p.bbox;
                
                const scaledX = x * scale - offsetX;
                const scaledY = y * scale - offsetY;
                const scaledWidth = width * scale;
                const scaledHeight = height * scale;

                const className = p.class.toLowerCase();
                let strokeColor = '#22c55e';
                let labelText = '';

                if (className.includes('bottle')) {
                    strokeColor = '#38bdf8';
                    labelText = `ขวดพลาสติก`;
                } else if (className.includes('glass')) {
                    strokeColor = '#a855f7';
                    labelText = `เครื่องแก้ว`;
                } else if (className === 'cup') {
                    strokeColor = '#f43f5e';
                    labelText = `แก้ว/ถ้วย`;
                }
                
                if (!labelText) return;

                const fullLabel = `${labelText} (${Math.round(p.score * 100)}%)`;
                
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 4;
                ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
                
                const textWidth = ctx.measureText(fullLabel).width;
                ctx.fillStyle = strokeColor;
                ctx.fillRect(scaledX, scaledY, textWidth + 12, 24);

                ctx.fillStyle = '#ffffff';
                ctx.fillText(fullLabel, scaledX + 6, scaledY + 4);
            });
        } else if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if(ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, [predictions, view]);

    const startCamera = async () => {
        if (!videoRef.current) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } });
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
                setView('scanning');
            };
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setPredictions([]);
    };

    const handleConfirm = async () => {
        if (earnedPoints === 0 || !currentUser) {
            alert("ไม่พบวัตถุที่สามารถรีไซเคิลได้");
            return;
        }

        setIsProcessing(true);
        setView('summary');
        stopCamera();
        detectionHistoryRef.current = [];
        setPredictions([]);

        const tierBonus = TIERS[currentUser.tier].bonus;
        const finalPoints = Math.round(earnedPoints * tierBonus);
        
        const activityDescription = [
            scanResult.bottles > 0 ? `${scanResult.bottles} ขวดพลาสติก` : '',
            scanResult.cups > 0 ? `${scanResult.cups} ถ้วย/แก้ว` : '',
            scanResult.glass > 0 ? `${scanResult.glass} เครื่องแก้ว` : '',
        ].filter(Boolean).join(', ');

        addActivity(currentUser.id, {
            description: `สแกน: ${activityDescription}`,
            points: finalPoints,
            type: 'earn'
        }, scanResult);
        
        setSummaryData({ points: finalPoints, tip: '', result: scanResult });
        const tip = await getEcoTip(scanResult);
        setSummaryData(prev => prev ? { ...prev, tip } : null);
        setIsProcessing(false);
    };
    
    if (view === 'summary' && summaryData) {
        return (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white rounded-2xl shadow-lg p-6 text-center space-y-6">
                <motion.div initial={{scale:0.5}} animate={{scale:1}} transition={{type: 'spring', delay: 0.2}}>
                    <CheckCircle2 size={60} className="mx-auto text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-slate-800">บันทึกการรีไซเคิลสำเร็จ!</h2>
                
                <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.4}} className="bg-slate-100 p-4 rounded-xl">
                    <p className="text-slate-600">คุณได้รับ</p>
                    <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">{summaryData.points.toLocaleString()} คะแนน</p>
                </motion.div>
                
                <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.6}} className="text-left bg-sky-50 border border-sky-200 p-4 rounded-xl space-y-3">
                     <div className="flex items-center space-x-3">
                        <Bot size={28} className="text-sky-600 flex-shrink-0" />
                        <h3 className="font-bold text-sky-800">เคล็ดลับรักษ์โลกจาก AI</h3>
                    </div>
                    {isProcessing && !summaryData.tip ? (
                         <div className="h-16 bg-slate-200 rounded-lg animate-pulse"></div>
                    ) : (
                         <p className="text-sky-900">{summaryData.tip}</p>
                    )}
                </motion.div>

                <motion.button 
                    initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.8}}
                    onClick={() => onNavigate('dashboard')} 
                    className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors shadow-md">
                    กลับไปหน้าหลัก
                </motion.button>
            </motion.div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-4">
             <div className="flex items-center justify-between mb-4 px-2 pt-2 sm:px-0 sm:pt-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">สแกนเพื่อรีไซเคิล</h2>
                <button onClick={() => { stopCamera(); onNavigate('dashboard'); }} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="relative mb-4 overflow-hidden rounded-lg aspect-[3/4] sm:aspect-video bg-slate-900">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline></video>
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>
                
                <AnimatePresence>
                {view === 'scanning' &&
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-2 sm:inset-4 border-2 border-white/40 rounded-lg"><div className="scan-line"></div></div>
                        <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 bg-black/60 backdrop-blur-sm text-white p-2 sm:p-3 rounded-lg">
                            <div className="flex justify-around text-center">
                                <div className="w-1/3"><GlassWater className="mx-auto mb-1 text-sky-300" size={20} /><div className="font-bold text-lg">{scanResult.bottles}</div><div className="text-xs">ขวดพลาสติก</div></div>
                                <div className="w-1/3"><CupSoda className="mx-auto mb-1 text-rose-300" size={20} /><div className="font-bold text-lg">{scanResult.cups}</div><div className="text-xs">แก้ว/ถ้วย</div></div>
                                <div className="w-1/3"><Trash2 className="mx-auto mb-1 text-purple-300" size={20} /><div className="font-bold text-lg">{scanResult.glass}</div><div className="text-xs">เครื่องแก้ว</div></div>
                            </div>
                        </div>
                    </motion.div>
                }
                </AnimatePresence>
            </div>
            
            {view === 'idle' && (
                <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={startCamera} 
                    disabled={isLoading} 
                    className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-sky-500 to-sky-700 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 transition-all shadow-lg hover:shadow-xl hover:from-sky-600">
                    {isLoading ? 'กำลังโหลด AI...' : <><Camera size={24} /><span>เริ่มสแกน</span></> }
                </motion.button>
            )}

            {view === 'scanning' && (
                 <div className="flex space-x-4">
                    <motion.button whileTap={{scale:0.95}} onClick={() => { stopCamera(); setView('idle'); detectionHistoryRef.current = []; }} className="flex-1 bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md">หยุด</motion.button>
                    <motion.button whileTap={{scale:0.95}} onClick={handleConfirm} disabled={earnedPoints === 0} className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md">ยืนยัน</motion.button>
                </div>
            )}
        </div>
    );
};

const RewardsScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, addActivity, rewards } = useAppData();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', success: true});

    const handleRedeem = (reward: Reward) => {
        if (currentUser && currentUser.points >= reward.cost) {
            addActivity(currentUser.id, {
                description: `แลกรางวัล: ${reward.name}`,
                points: -reward.cost,
                type: 'redeem'
            });
            setModalContent({title: 'แลกรางวัลสำเร็จ!', message: `คุณได้แลก "${reward.name}" สำเร็จแล้ว!`, success: true});
        } else {
            setModalContent({title: 'คะแนนไม่เพียงพอ', message: `คุณต้องการ ${reward.cost.toLocaleString()} คะแนนเพื่อแลกรางวัลนี้`, success: false});
        }
        setModalOpen(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
             <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalContent.title}>
                 <div className="flex items-start space-x-3">
                    {modalContent.success ? <CheckCircle2 className="text-green-500 mt-1"/> : <Info className="text-red-500 mt-1"/> }
                    <p className="text-slate-600">{modalContent.message}</p>
                 </div>
                 <button onClick={() => setModalOpen(false)} className="mt-6 w-full bg-sky-600 text-white py-2.5 rounded-lg font-semibold hover:bg-sky-700 transition-colors">ตกลง</button>
            </Modal>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">แลกรางวัล</h2>
                <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
            </div>
            <div className="text-center mb-6 bg-slate-100 p-4 rounded-xl border border-slate-200">
                 <p className="text-slate-600">คะแนนของคุณ</p>
                 <p className="font-bold text-sky-600 text-3xl">{currentUser?.points.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.sort((a,b) => a.cost - b.cost).map(reward => (
                    <RewardCard key={reward.id} reward={reward} onRedeem={handleRedeem} userPoints={currentUser?.points || 0} />
                ))}
            </div>
        </div>
    );
};

const ProfileScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, updateUserName } = useAppData();
    const [name, setName] = useState(currentUser?.name || '');
    const [isSaved, setIsSaved] = useState(false);

    if (!currentUser) return null;

    const handleSave = () => {
        if(name.trim() === '') {
            alert('ชื่อที่แสดงผลต้องไม่ว่างเปล่า');
            return;
        }
        updateUserName(currentUser.id, name.trim());
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">โปรไฟล์ของฉัน</h2>
                <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">ชื่อที่แสดง</label>
                    <input 
                        id="displayName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                        placeholder="ชื่อของคุณ"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">หมายเลขโทรศัพท์</label>
                    <p className="w-full px-4 py-3 bg-slate-100 text-slate-600 rounded-lg">{currentUser.phone}</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">สมาชิกตั้งแต่</label>
                    <p className="w-full px-4 py-3 bg-slate-100 text-slate-600 rounded-lg">{formatDate(currentUser.joinDate)}</p>
                </div>
            </div>

            <motion.button 
                whileTap={{scale: 0.97}}
                onClick={handleSave} 
                disabled={name === currentUser.name || isSaved}
                className={`w-full flex items-center justify-center space-x-2 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md ${isSaved ? 'bg-green-500' : 'bg-sky-600 hover:bg-sky-700 disabled:opacity-50'}`}
            >
                {isSaved ? <Check size={20}/> : <Save size={20}/>}
                <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกการเปลี่ยนแปลง'}</span>
            </motion.button>
        </div>
    );
};

const LeaderboardScreen: React.FC<{ onNavigate: (screen: Screen) => void }> = ({ onNavigate }) => {
    const { currentUser, leaderboardData } = useAppData();

    const currentUserRank = currentUser ? leaderboardData.findIndex(u => u.id === currentUser.id) + 1 : null;
    
    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 pb-24">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">ตารางผู้นำ</h2>
                <button onClick={() => onNavigate('dashboard')} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="space-y-2">
                {leaderboardData.map((user, index) => (
                     <LeaderboardItem key={user.id} user={user} rank={index + 1} isCurrentUser={currentUser?.id === user.id} />
                ))}
            </div>

            {currentUser && currentUserRank && currentUserRank > 0 && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl md:max-w-3xl lg:max-w-4xl px-4 pointer-events-none">
                     <motion.div 
                        initial={{y: 100, opacity: 0}} 
                        animate={{y: 0, opacity: 1}} 
                        transition={{type: 'spring', damping: 20, stiffness: 200}}
                        className="bg-white/80 backdrop-blur-lg border-2 border-sky-400 rounded-xl shadow-2xl p-3 pointer-events-auto">
                         <LeaderboardItem user={currentUser} rank={currentUserRank} isCurrentUser={true} />
                     </motion.div>
                </div>
            )}
        </div>
    );
};

// ####################
// ### CHILD COMPONENTS ###
// ####################

const QuickActionCard: React.FC<{onClick: () => void; icon: React.ReactNode; label: string; color: string}> = ({onClick, icon, label, color}) => {
    const colors: { [key: string]: string } = {
        sky: 'from-sky-400 to-sky-600 text-white',
        violet: 'from-violet-400 to-violet-600 text-white',
        amber: 'from-amber-400 to-amber-600 text-white',
    };
    return (
        <motion.button 
            onClick={onClick} 
            className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-lg p-4 h-full transition-all group flex flex-col items-center justify-center text-center`}
            whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="mb-2 transition-transform">{icon}</div>
            <h3 className="text-sm md:text-base font-semibold">{label}</h3>
        </motion.button>
    );
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const isEarn = activity.type === 'earn';

    return (
        <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 ${isEarn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} rounded-full flex items-center justify-center`}>
                    {isEarn ? <Recycle size={20} /> : <Gift size={20}/>}
                </div>
                <div>
                    <p className="font-semibold text-slate-800 text-sm sm:text-base">{activity.description}</p>
                    <p className="text-xs text-slate-500">{formatDate(activity.timestamp)}</p>
                </div>
            </div>
            <span className={`font-semibold text-sm ${isEarn ? 'text-green-600' : 'text-red-600'}`}>
                {activity.points > 0 ? '+' : ''}{activity.points.toLocaleString()}
            </span>
        </div>
    );
};

const RewardCard: React.FC<{ reward: Reward; onRedeem: (reward: Reward) => void; userPoints: number }> = ({ reward, onRedeem, userPoints }) => {
    const canAfford = userPoints >= reward.cost;
    const Icon = rewardIconMap[reward.iconName] || Gift;
    return (
        <div className={`bg-white rounded-xl p-4 border ${reward.borderColor} flex flex-col justify-between shadow-md hover:shadow-lg transition-shadow`}>
            <div className="flex items-start space-x-4">
                 <div className={`w-16 h-16 ${reward.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
                    <Icon size={32} className="text-white"/>
                </div>
                <div className="flex-grow">
                     <h3 className="font-bold text-slate-800 text-base">{reward.name}</h3>
                     <p className="text-xs text-slate-600 mt-1">{reward.description}</p>
                </div>
            </div>
            <div className="flex items-end justify-between mt-4">
                <div className="text-lg font-bold text-sky-600">{reward.cost.toLocaleString()} <span className="text-sm font-normal">คะแนน</span></div>
                <motion.button 
                    whileTap={{scale:0.95}}
                    onClick={() => onRedeem(reward)} 
                    disabled={!canAfford} 
                    className="bg-sky-600 text-white px-5 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700 transition-all shadow"
                >
                    {canAfford ? 'แลก' : 'ไม่พอ'}
                </motion.button>
            </div>
        </div>
    );
};

const LeaderboardItem: React.FC<{user: LeaderboardUser | User; rank: number; isCurrentUser: boolean}> = ({ user, rank, isCurrentUser }) => {
    const rankColors: { [key: number]: string } = {
        1: 'bg-amber-400 text-white shadow-amber-300/50',
        2: 'bg-slate-400 text-white shadow-slate-300/50',
        3: 'bg-amber-600 text-white shadow-yellow-700/50'
    };
    
    const rankIcon: { [key: number]: React.ReactNode } = {
        1: <Crown size={16} className="text-white" />,
        2: <Crown size={16} className="text-white" />,
        3: <Crown size={16} className="text-white" />,
    };

    const tier = TIERS[user.tier];

    return (
        <div className={`flex items-center p-3 rounded-lg transition-all ${isCurrentUser ? 'bg-sky-100 border-2 border-sky-400 scale-100 shadow-lg' : 'bg-slate-50 border border-transparent'}`}>
            <div className="flex items-center space-x-3 w-1/2">
                <span className={`relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${rankColors[rank] || 'bg-slate-200 text-slate-600'}`}>
                    {rankIcon[rank] || rank}
                    {rank > 3 && <span className="z-10">{rank}</span>}
                </span>
                <div className="flex items-center space-x-2 overflow-hidden">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${tier.class}`}></div>
                    <span className="font-bold text-slate-800 truncate">{user.name}</span>
                </div>
            </div>
            <div className="flex-grow text-right flex items-center justify-end space-x-2">
                 <span className="font-bold text-sky-700 text-sm md:text-base">{user.points.toLocaleString()} <span className="text-xs font-normal text-slate-500">pts</span></span>
            </div>
        </div>
    )
}

const BottomNav: React.FC<{ activeScreen: Screen; onNavigate: (screen: Screen) => void; }> = ({ activeScreen, onNavigate }) => {
    const navItems = [
        { id: 'dashboard', icon: Home, label: 'หน้าหลัก' },
        { id: 'scan', icon: Camera, label: 'สแกน' },
        { id: 'rewards', icon: Gift, label: 'รางวัล' },
        { id: 'leaderboard', icon: Trophy, label: 'จัดอันดับ' },
    ] as const;

    if(activeScreen === 'profile') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg border-t border-slate-200 m-4 rounded-xl shadow-2xl shadow-slate-300/30">
                <LayoutGroup>
                <div className="flex justify-around">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => onNavigate(item.id)}
                            className={`relative flex flex-col items-center py-2.5 px-4 transition-colors duration-200 w-full ${activeScreen === item.id ? 'text-sky-600' : 'text-slate-500 hover:text-sky-500'}`}>
                            <item.icon size={24} />
                            <span className="text-xs font-medium mt-1">{item.label}</span>
                             {activeScreen === item.id && <motion.div layoutId="active-nav-indicator" className="absolute bottom-0 h-1 w-8 bg-sky-600 rounded-full"></motion.div>}
                        </button>
                    ))}
                </div>
                </LayoutGroup>
            </div>
        </div>
    );
};


// ####################
// ### MAIN COMPONENT ###
// ####################

const MainApp: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');

    const renderScreen = () => {
        switch (activeScreen) {
            case 'scan':
                return <ScanScreen onNavigate={setActiveScreen} />;
            case 'rewards':
                return <RewardsScreen onNavigate={setActiveScreen} />;
            case 'profile':
                return <ProfileScreen onNavigate={setActiveScreen} />;
            case 'leaderboard':
                return <LeaderboardScreen onNavigate={setActiveScreen} />;
            case 'dashboard':
            default:
                return <DashboardScreen onNavigate={setActiveScreen} />;
        }
    };

    return (
        <div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                    {renderScreen()}
                </motion.div>
            </AnimatePresence>
            <BottomNav activeScreen={activeScreen} onNavigate={setActiveScreen} />
        </div>
    );
};

export default MainApp;