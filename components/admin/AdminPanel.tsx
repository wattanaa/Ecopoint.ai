import React, { useState, useMemo } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { type AdminScreen, type User, type Reward, type AppSettings, TierName, RewardIconName } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, LogIn, LayoutDashboard, Users, Award, Settings, Trash2, Edit, PlusCircle, X, Save, Search, 
    AlertTriangle, Check, ArrowRight, Star, Recycle, LogOut 
} from 'lucide-react';
import { TIERS_ARRAY, TIERS, VALID_REWARD_ICONS } from '../../constants';


// ####################
// ### ADMIN LOGIN ###
// ####################
const AdminLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (password === 'admin123') { // Simple hardcoded password
            onLogin();
        } else {
            setError('รหัสผ่านไม่ถูกต้อง');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Admin Panel</h2>
                    <p className="text-slate-500">กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบ</p>
                </div>
                <div className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition"
                        placeholder="รหัสผ่าน"
                    />
                    <AnimatePresence>
                    {error && <motion.p initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} className="text-red-500 text-sm text-center">{error}</motion.p>}
                    </AnimatePresence>
                    <button onClick={handleLogin} className="w-full flex justify-center items-center space-x-2 bg-slate-800 text-white py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors shadow-md">
                        <LogIn size={20} />
                        <span>เข้าสู่ระบบ</span>
                    </button>
                </div>
                 <p className="text-xs text-slate-400 text-center mt-4">For demo purposes, password is: admin123</p>
            </motion.div>
        </div>
    );
};

// ####################
// ### LAYOUT & MODAL ###
// ####################
const AdminModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <motion.div initial={{ scale: 0.95, y:20, opacity: 0 }} animate={{ scale: 1, y:0, opacity: 1 }} exit={{ scale: 0.95, y:20, opacity: 0 }} transition={{ease: "easeInOut", duration: 0.2}} className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
                    </div>
                    <div className="p-6 bg-slate-50">{children}</div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const AdminLayout: React.FC<{ children: React.ReactNode; activeScreen: AdminScreen; onNavigate: (screen: AdminScreen) => void; onLogout: () => void }> = ({ children, activeScreen, onNavigate, onLogout }) => {
    const navItems: { id: AdminScreen; label: string; icon: React.FC<any> }[] = [
        { id: 'overview', label: 'ภาพรวม', icon: LayoutDashboard },
        { id: 'users', label: 'จัดการผู้ใช้', icon: Users },
        { id: 'rewards', label: 'จัดการรางวัล', icon: Award },
        { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
    ];
    return (
        <div className="md:flex md:space-x-8">
            <aside className="md:w-64 flex-shrink-0 mb-6 md:mb-0">
                <div className="bg-white p-4 rounded-xl shadow-lg h-full">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3 flex items-center gap-2"><Shield size={22}/>Admin Menu</h2>
                    <nav className="space-y-2">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${activeScreen === item.id ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <item.icon size={20} />
                                <span className="font-semibold">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                     <a href="/#" onClick={onLogout} className="w-full flex items-center space-x-3 p-3 mt-6 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 font-semibold">
                        <LogOut size={20} />
                        <span>ออกจากระบบ Admin</span>
                    </a>
                </div>
            </aside>
            <main className="flex-grow">
                 <AnimatePresence mode="wait">
                    <motion.div
                         key={activeScreen}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         transition={{ duration: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

// ####################
// ### ADMIN SCREENS ###
// ####################

const StatCard: React.FC<{label: string, value: string | number, icon: React.ReactNode}> = ({label, value, icon}) => (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center gap-4">
        <div className="p-3 bg-white rounded-full border border-slate-200 text-slate-600">{icon}</div>
        <div>
            <p className="text-slate-500 font-semibold">{label}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
)

const OverviewScreen: React.FC = () => {
    const { users } = useAppData();
    const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
    const totalRecycledItems = users.reduce((sum, u) => sum + u.totalBottles + u.totalCups + u.totalGlass, 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">ภาพรวมระบบ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <StatCard label="ผู้ใช้ทั้งหมด" value={users.length.toLocaleString()} icon={<Users size={24}/>} />
               <StatCard label="คะแนนในระบบ" value={totalPoints.toLocaleString()} icon={<Star size={24}/>} />
               <StatCard label="ของที่รีไซเคิล" value={totalRecycledItems.toLocaleString()} icon={<Recycle size={24}/>} />
            </div>
        </div>
    );
};

const UserManagementScreen: React.FC = () => {
    const { users, updateUserAdmin, deleteUserAdmin } = useAppData();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');

    const filteredUsers = useMemo(() => users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.phone.includes(search)
    ).sort((a,b) => b.points - a.points), [users, search]);

    const handleSave = (user: User) => {
        updateUserAdmin(user);
        setEditingUser(null);
    };
    
    const handleDelete = (user: User) => {
        if (window.confirm(`ต้องการลบผู้ใช้ ${user.name} หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
            deleteUserAdmin(user.id);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
             <h3 className="text-2xl font-bold text-slate-800">จัดการผู้ใช้ ({users.length})</h3>
             <div className="relative">
                <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input type="text" placeholder="ค้นหาด้วยชื่อหรือเบอร์โทร..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400" />
             </div>
             <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
                 {filteredUsers.map(user => {
                     const tier = TIERS[user.tier];
                     return (
                         <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                             <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${tier.class}`}></div>
                                 <div>
                                     <p className="font-bold text-slate-800">{user.name} <span className="text-sm font-normal text-slate-500">({user.tier})</span></p>
                                     <p className="text-sm text-slate-600">{user.phone} - {user.points.toLocaleString()} pts</p>
                                 </div>
                             </div>
                             <div className="flex space-x-1">
                                 <button onClick={() => setEditingUser(user)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><Edit size={16} /></button>
                                 <button onClick={() => handleDelete(user)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"><Trash2 size={16} /></button>
                             </div>
                         </div>
                     )
                 })}
             </div>
             <AdminModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="แก้ไขข้อมูลผู้ใช้">
                {editingUser && <UserEditForm user={editingUser} onSave={handleSave} onCancel={() => setEditingUser(null)} />}
             </AdminModal>
        </div>
    );
};

const UserEditForm: React.FC<{user: User, onSave: (user: User) => void, onCancel: () => void}> = ({user, onSave, onCancel}) => {
    const [formData, setFormData] = useState(user);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = ['points', 'totalBottles', 'totalCups', 'totalGlass'].includes(name);
        setFormData(prev => ({...prev, [name as keyof User]: isNumber ? Number(value) : value}));
    }
    
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block font-semibold text-slate-700 mb-1">ID</label><p className="text-sm text-slate-600 bg-slate-200 px-3 py-2 rounded-md">{formData.id}</p></div>
                <div><label className="block font-semibold text-slate-700 mb-1">Phone</label><p className="text-sm text-slate-600 bg-slate-200 px-3 py-2 rounded-md">{formData.phone}</p></div>
            </div>
            <div><label className="block font-semibold text-slate-700 mb-1">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300"/></div>
            <div><label className="block font-semibold text-slate-700 mb-1">Tier</label>
                <select name="tier" value={formData.tier} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300">
                    {TIERS_ARRAY.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
            </div>
            <div><label className="block font-semibold text-slate-700 mb-1">Points</label><input type="number" name="points" value={formData.points} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300"/></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block font-semibold text-slate-700 mb-1">Bottles</label><input type="number" name="totalBottles" value={formData.totalBottles} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300"/></div>
                <div><label className="block font-semibold text-slate-700 mb-1">Cups</label><input type="number" name="totalCups" value={formData.totalCups} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300"/></div>
                <div><label className="block font-semibold text-slate-700 mb-1">Glass</label><input type="number" name="totalGlass" value={formData.totalGlass} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300"/></div>
            </div>
             <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">ยกเลิก</button>
                <button type="submit" className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">บันทึก</button>
            </div>
        </form>
    )
}

const RewardManagementScreen: React.FC = () => {
    const { rewards, saveRewardAdmin, deleteRewardAdmin } = useAppData();
    const [editingReward, setEditingReward] = useState<Reward | Partial<Reward> | null>(null);

    const handleSave = (reward: Reward | Partial<Reward>) => {
        // Simple validation
        if (!reward.name || !reward.cost || !reward.iconName) {
            alert('กรุณากรอกข้อมูลให้ครบ: Name, Cost, Icon Name');
            return;
        }
        saveRewardAdmin(reward as Reward);
        setEditingReward(null);
    }

    const handleDelete = (reward: Reward) => {
        if(window.confirm(`ต้องการลบรางวัล "${reward.name}" หรือไม่?`)) {
            deleteRewardAdmin(reward.id);
        }
    }
    
    return (
         <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-bold text-slate-800">จัดการรางวัล ({rewards.length})</h3>
                 <button onClick={() => setEditingReward({})} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                     <PlusCircle size={18} /><span>เพิ่มรางวัล</span>
                </button>
            </div>
             <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
                {rewards.sort((a,b) => a.cost - b.cost).map(reward => (
                    <div key={reward.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                        <div>
                            <p className="font-bold text-slate-800">{reward.name} <span className="text-sm font-normal text-slate-500">({reward.iconName})</span></p>
                            <p className="text-sm text-slate-600">{reward.cost.toLocaleString()} pts</p>
                        </div>
                        <div className="flex space-x-1">
                            <button onClick={() => setEditingReward(reward)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(reward)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
            <AdminModal isOpen={!!editingReward} onClose={() => setEditingReward(null)} title={editingReward?.id ? 'แก้ไขรางวัล' : 'เพิ่มรางวัลใหม่'}>
                {editingReward && <RewardEditForm reward={editingReward} onSave={handleSave} onCancel={() => setEditingReward(null)} />}
            </AdminModal>
        </div>
    );
};

const RewardEditForm: React.FC<{reward: Reward | Partial<Reward>, onSave: (reward: Reward | Partial<Reward>) => void, onCancel: () => void}> = ({reward, onSave, onCancel}) => {
    const [formData, setFormData] = useState<Partial<Reward> & { cost?: number }>({
        id: undefined,
        name: '',
        description: 'คำอธิบายรางวัล',
        cost: 0,
        iconName: 'Gift',
        gradient: 'from-gray-50 to-slate-50',
        borderColor: 'border-gray-200',
        iconBg: 'bg-gradient-to-br from-gray-400 to-slate-500',
        ...reward
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'cost' ? Number(value) : value }));
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-4">
            <div><label className="block font-semibold text-slate-700 mb-1">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300"/></div>
            <div><label className="block font-semibold text-slate-700 mb-1">Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300" rows={2}></textarea></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cost (Points)</label>
                    <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300"/>
                </div>
                <div>
                   <label className="block font-semibold text-slate-700 mb-1">Icon Name</label>
                   <select name="iconName" value={formData.iconName} onChange={handleChange} className="w-full p-2 border rounded-md border-slate-300">
                       {VALID_REWARD_ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                   </select>
               </div>
            </div>
             <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">ยกเลิก</button>
                <button type="submit" className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">บันทึก</button>
            </div>
        </form>
    )
};

const SettingsScreen: React.FC = () => {
    const { settings, saveSettingsAdmin } = useAppData();
    const [formState, setFormState] = useState<AppSettings | null>(settings);
    const [isSaved, setIsSaved] = useState(false);

    if (!formState) { return <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse h-64"></div>; }
    
    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(p => p ? { ...p, points: { ...p.points, [name as keyof AppSettings['points']]: Number(value) || 0 } } : null);
    };
    
    const handleTierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const tierName = name as TierName;
        const newMax = Number(value);

        setFormState(prevSettings => {
            if (!prevSettings) return null;

            const newTiers = { ...prevSettings.tiers };
            newTiers[tierName].max = newMax;

            // Update the min of the next tier
            const currentTierIndex = TIERS_ARRAY.findIndex(t => t.name === tierName);
            if (currentTierIndex < TIERS_ARRAY.length - 1) {
                const nextTierName = TIERS_ARRAY[currentTierIndex + 1].name;
                newTiers[nextTierName].min = newMax + 1;
            }

            return { ...prevSettings, tiers: newTiers };
        });
    };

    const handleSave = () => {
        if (formState) {
            saveSettingsAdmin(formState);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
            <h3 className="text-2xl font-bold text-slate-800">ตั้งค่าระบบ</h3>
            
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <h4 className="font-bold text-lg text-slate-700">คะแนนที่ได้รับ</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.keys(formState.points) as (keyof AppSettings['points'])[]).map(key => (
                        <div key={key}>
                            <label className="block font-semibold text-slate-700 mb-1 capitalize">{key}</label>
                            <input type="number" name={key} value={formState.points[key]} onChange={handlePointsChange} className="w-full p-2 border rounded-md border-slate-300"/>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                <h4 className="font-bold text-lg text-slate-700">ระดับขั้น (Tier)</h4>
                <div className="space-y-3">
                    {TIERS_ARRAY.map((tier) => (
                        <div key={tier.name} className="grid grid-cols-3 items-center gap-2">
                            <span className="font-bold text-slate-800">{tier.name}</span>
                            <div className="col-span-2 flex items-center gap-2">
                                <input type="number" value={formState.tiers[tier.name].min} readOnly className="w-full p-2 border rounded-md border-slate-300 bg-slate-200" />
                                <span className="text-slate-500">-</span>
                                <input 
                                    type="number"
                                    name={tier.name}
                                    value={formState.tiers[tier.name].max === Infinity ? '' : formState.tiers[tier.name].max}
                                    onChange={handleTierChange}
                                    readOnly={tier.name === 'Diamond'}
                                    placeholder={tier.name === 'Diamond' ? 'ไม่จำกัด' : ''}
                                    className="w-full p-2 border rounded-md border-slate-300 read-only:bg-slate-200 read-only:cursor-not-allowed" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-600 bg-yellow-100 border border-yellow-200 p-3 rounded-lg">
                    <AlertTriangle size={32} className="text-yellow-600 flex-shrink-0 mt-0.5"/>
                    <span><strong>หมายเหตุ:</strong> การแก้ไขค่าสูงสุด (max) ของระดับขั้น จะอัปเดตค่าต่ำสุด (min) ของระดับถัดไปโดยอัตโนมัติ การตั้งค่าระดับ Bronze และ Diamond ถูกจำกัดไว้</span>
                </div>
            </div>
            
            <motion.button 
                whileTap={{scale: 0.97}} onClick={handleSave}
                className={`w-full flex items-center justify-center space-x-2 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-md ${isSaved ? 'bg-green-500' : 'bg-slate-800 hover:bg-slate-900'}`}>
                {isSaved ? <Check size={20}/> : <Save size={20}/>}
                <span>{isSaved ? 'บันทึกแล้ว' : 'บันทึกการตั้งค่า'}</span>
            </motion.button>
        </div>
    );
};

const AdminPanel: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeScreen, setActiveScreen] = useState<AdminScreen>('overview');

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }
    
    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    const renderScreen = () => {
        switch (activeScreen) {
            case 'users': return <UserManagementScreen />;
            case 'rewards': return <RewardManagementScreen />;
            case 'settings': return <SettingsScreen />;
            case 'overview':
            default: return <OverviewScreen />;
        }
    };

    return (
        <AdminLayout activeScreen={activeScreen} onNavigate={setActiveScreen} onLogout={handleLogout}>
            {renderScreen()}
        </AdminLayout>
    );
};

export default AdminPanel;