import { User, Reward, AppSettings, TierName } from '../types';
import { TIERS } from '../constants';

// --- Default Data for Initialization ---
const DEFAULT_REWARDS: Omit<Reward, 'id'>[] = [
  {
    name: 'ถุงผ้า Eco-Friendly',
    description: 'ถุงผ้าเพื่อสิ่งแวดล้อม',
    cost: 2500,
    iconName: 'ShoppingBag',
    gradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
  },
  {
    name: 'บัตรกำนัลร้านกาแฟ',
    description: 'ส่วนลด 50 บาท ที่ร้านกาแฟออร์แกนิค',
    cost: 1500,
    iconName: 'Coffee',
    gradient: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500',
  },
  {
    name: 'กล่องสุ่มรักษ์โลก',
    description: 'ของรางวัลพิเศษในกล่อง',
    cost: 4500,
    iconName: 'Box',
    gradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  },
   {
    name: 'เสื้อยืด EcoPoint',
    description: 'ทำจากผ้าฝ้ายรีไซเคิล 100%',
    cost: 6000,
    iconName: 'Shirt',
    gradient: 'from-teal-50 to-cyan-50',
    borderColor: 'border-teal-200',
    iconBg: 'bg-gradient-to-br from-teal-400 to-cyan-500',
  },
  {
    name: 'บัตรกำนัลส่วนลด',
    description: 'สำหรับร้านค้าที่ร่วมรายการ',
    cost: 8000,
    iconName: 'Gift',
    gradient: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-gradient-to-br from-purple-400 to-pink-500',
  },
  {
    name: 'บริจาคปลูกป่า',
    description: 'ร่วมปลูกต้นไม้ 1 ต้นในนามของคุณ',
    cost: 10000,
    iconName: 'Sprout',
    gradient: 'from-lime-50 to-green-50',
    borderColor: 'border-lime-200',
    iconBg: 'bg-gradient-to-br from-lime-400 to-green-500',
  },
];

const DEFAULT_USERS: Omit<User, 'id'>[] = [
    { name: 'สมชาย รักษ์โลก', phone: '0812345678', points: 15230, totalBottles: 200, totalCups: 500, totalGlass: 150, tier: 'Diamond', history: [], joinDate: new Date().toISOString() },
    { name: 'มานี ใจดี', phone: '0887654321', points: 9850, totalBottles: 150, totalCups: 400, totalGlass: 100, tier: 'Platinum', history: [], joinDate: new Date().toISOString() },
    { name: 'Peter Pan', phone: '0811111111', points: 450, totalBottles: 10, totalCups: 10, totalGlass: 10, tier: 'Bronze', history: [], joinDate: new Date().toISOString() },
];

const DEFAULT_SETTINGS: AppSettings = {
    points: {
        bottle: 10,
        cup: 12, // Changed from can
        glass: 20,
    },
    tiers: {
        Bronze: { min: 0, max: 499 },
        Silver: { min: 500, max: 1999 },
        Gold: { min: 2000, max: 4999 },
        Platinum: { min: 5000, max: 9999 },
        Diamond: { min: 10000, max: Infinity },
    }
};


interface Database {
    users: User[];
    rewards: Reward[];
    settings: AppSettings;
}

const DB_KEY = 'ecoPointDB';

const getDB = (): Database => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : { users: [], rewards: [], settings: DEFAULT_SETTINGS };
};

const saveDB = (db: Database) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const initDB = () => {
    if (localStorage.getItem(DB_KEY)) return;
    
    console.log("Initializing database with default data...");

    const db: Database = {
        users: DEFAULT_USERS.map(user => ({...user, id: crypto.randomUUID()})),
        rewards: DEFAULT_REWARDS.map(reward => ({...reward, id: crypto.randomUUID()})),
        settings: DEFAULT_SETTINGS,
    };
    saveDB(db);
};

// Initialize on load
initDB();

// --- API ---

// Users
export const dbGetUsers = (): User[] => getDB().users;
export const dbGetUser = (id: string): User | undefined => getDB().users.find(u => u.id === id);
export const dbGetUserByPhone = (phone: string): User | undefined => getDB().users.find(u => u.phone === phone);
export const dbCreateUser = (phone: string): User => {
    const db = getDB();
    const newUser: User = {
        id: crypto.randomUUID(),
        name: 'นักรักษ์โลก',
        phone,
        points: 100, // Welcome bonus
        totalBottles: 0,
        totalCups: 0, // Changed from totalCans
        totalGlass: 0,
        tier: 'Bronze',
        history: [{
            id: Date.now(),
            description: 'ยินดีต้อนรับสมาชิกใหม่!',
            points: 100,
            timestamp: new Date().toISOString(),
            type: 'earn'
        }],
        joinDate: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB(db);
    return newUser;
};
export const dbUpdateUser = (updatedUser: User): User => {
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === updatedUser.id);
    if (userIndex === -1) throw new Error("User not found");
    db.users[userIndex] = updatedUser;
    saveDB(db);
    return updatedUser;
};
export const dbDeleteUser = (id: string): void => {
    const db = getDB();
    db.users = db.users.filter(u => u.id !== id);
    saveDB(db);
};

// Rewards
export const dbGetRewards = (): Reward[] => getDB().rewards;
export const dbSaveReward = (reward: Reward): Reward => {
    const db = getDB();
    const rewardIndex = db.rewards.findIndex(r => r.id === reward.id);
    if (rewardIndex !== -1) {
        db.rewards[rewardIndex] = reward;
    } else {
        db.rewards.push(reward);
    }
    saveDB(db);
    return reward;
};
export const dbDeleteReward = (id: string): void => {
    const db = getDB();
    db.rewards = db.rewards.filter(r => r.id !== id);
    saveDB(db);
};

// Settings
export const dbGetSettings = (): AppSettings => getDB().settings;
export const dbSaveSettings = (settings: AppSettings): AppSettings => {
    const db = getDB();
    db.settings = settings;
    saveDB(db);
    return settings;
};