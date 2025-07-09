import React, { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Leaf, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const { loginUser, checkUserExists } = useAppData();

  const handleSendOtp = () => {
    if (phone.length >= 10) {
      const userExists = checkUserExists(phone);
      setIsNewUser(!userExists);
      setStep('otp');
    } else {
      alert('กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง');
    }
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') { // Demo OTP
      loginUser(phone);
    } else {
      alert('รหัส OTP ไม่ถูกต้อง');
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setIsNewUser(null);
  };

  // Auto-fill OTP for demo purposes
  useEffect(() => {
    if (step === 'otp') {
      const timer = setTimeout(() => {
        setOtp('123456');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step]);


  return (
    <div className="flex flex-col justify-center min-h-[80vh]">
      <div className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden">
        <AnimatePresence mode="wait">
        <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 'phone' ? 0 : -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 'phone' ? 300 : -300 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        >
        {step === 'phone' && (
            <div>
                 <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Leaf size={40} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        ยินดีต้อนรับสู่ EcoPoint AI
                    </h2>
                    <p className="text-slate-500">ระบบแลกขวดอัจฉริยะเพื่อสิ่งแวดล้อม</p>
                </div>
                <div className="space-y-6">
                <div>
                    <label className="block text-slate-700 font-semibold mb-2">หมายเลขโทรศัพท์</label>
                    <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendOtp()}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    placeholder="08X-XXX-XXXX"
                    />
                </div>
                <button onClick={handleSendOtp} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md hover:shadow-lg">
                    รับรหัส OTP
                </button>
                </div>
            </div>
        )}

        {step === 'otp' && (
            <div>
                 <div className="text-center mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-br ${isNewUser ? 'from-sky-400 to-blue-500' : 'from-emerald-400 to-green-500'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        {isNewUser ? <UserPlus size={40} className="text-white" /> : <LogIn size={40} className="text-white" />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        {isNewUser ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบ'}
                    </h2>
                    <p className="text-slate-500">{isNewUser ? `เราจะสร้างบัญชีใหม่สำหรับเบอร์ ${phone}` : `ยินดีต้อนรับกลับมา, ${phone}`}</p>
                </div>
                <div className="space-y-6">
                <div>
                    <label className="block text-slate-700 font-semibold mb-2">กรอกรหัส OTP 6 หลัก</label>
                    <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-2xl tracking-widest transition"
                    placeholder="· · · · · ·"
                    maxLength={6}
                    />
                     <p className="text-sm text-slate-400 mt-2 text-center">(Demo: รหัส OTP คือ 123456)</p>
                </div>
                <div className="space-y-3">
                    <button onClick={handleVerifyOtp} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md hover:shadow-lg">
                    ยืนยันและดำเนินการต่อ
                    </button>
                    <button onClick={handleBackToPhone} className="w-full text-slate-600 py-2 hover:bg-slate-100 rounded-lg transition-all">
                    กลับไปแก้ไขเบอร์โทร
                    </button>
                </div>
                </div>
            </div>
        )}
        </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginScreen;
