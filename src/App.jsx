import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, onSnapshot, query, where } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronLeft, ChevronRight, Plus, BookOpen, Clock, BarChart2, CheckCircle, Search, Star, Edit, Trash2 } from 'lucide-react';

// --- Firebase Configuration ---
// This configuration is provided by the environment.
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "AIzaSyDl4r3Ajw7kzyky9UOSGvepIl7aBDHUhCg",
  authDomain: "quran-memorisation-76544.firebaseapp.com",
  projectId: "quran-memorisation-76544",
  storageBucket: "quran-memorisation-76544.firebasestorage.app",
  messagingSenderId: "515194413011",
  appId: "1:515194413011:web:515c906be203a6386f9926"
};

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Constants ---
const SURAHS = [
    { id: 1, name: "Al-Fatihah", ayahs: 7 }, { id: 2, name: "Al-Baqarah", ayahs: 286 }, { id: 3, name: "Aal-E-Imran", ayahs: 200 },
    { id: 4, name: "An-Nisa", ayahs: 176 }, { id: 5, name: "Al-Ma'idah", ayahs: 120 }, { id: 6, name: "Al-An'am", ayahs: 165 },
    { id: 7, name: "Al-A'raf", ayahs: 206 }, { id: 8, name: "Al-Anfal", ayahs: 75 }, { id: 9, name: "At-Tawbah", ayahs: 129 },
    { id: 10, name: "Yunus", ayahs: 109 }, { id: 11, name: "Hud", ayahs: 123 }, { id: 12, name: "Yusuf", ayahs: 111 },
    { id: 13, name: "Ar-Ra'd", ayahs: 43 }, { id: 14, name: "Ibrahim", ayahs: 52 }, { id: 15, name: "Al-Hijr", ayahs: 99 },
    { id: 16, name: "An-Nahl", ayahs: 128 }, { id: 17, name: "Al-Isra", ayahs: 111 }, { id: 18, name: "Al-Kahf", ayahs: 110 },
    { id: 19, name: "Maryam", ayahs: 98 }, { id: 20, name: "Taha", ayahs: 135 }, { id: 21, name: "Al-Anbiya", ayahs: 112 },
    { id: 22, name: "Al-Hajj", ayahs: 78 }, { id: 23, name: "Al-Mu'minun", ayahs: 118 }, { id: 24, name: "An-Nur", ayahs: 64 },
    { id: 25, name: "Al-Furqan", ayahs: 77 }, { id: 26, name: "Ash-Shu'ara", ayahs: 227 }, { id: 27, name: "An-Naml", ayahs: 93 },
    { id: 28, name: "Al-Qasas", ayahs: 88 }, { id: 29, name: "Al-Ankabut", ayahs: 69 }, { id: 30, name: "Ar-Rum", ayahs: 60 },
    { id: 31, name: "Luqman", ayahs: 34 }, { id: 32, name: "As-Sajdah", ayahs: 30 }, { id: 33, name: "Al-Ahzab", ayahs: 73 },
    { id: 34, name: "Saba", ayahs: 54 }, { id: 35, name: "Fatir", ayahs: 45 }, { id: 36, name: "Ya-Sin", ayahs: 83 },
    { id: 37, name: "As-Saffat", ayahs: 182 }, { id: 38, name: "Sad", ayahs: 88 }, { id: 39, name: "Az-Zumar", ayahs: 75 },
    { id: 40, name: "Ghafir", ayahs: 85 }, { id: 41, name: "Fussilat", ayahs: 54 }, { id: 42, name: "Ash-Shura", ayahs: 53 },
    { id: 43, name: "Az-Zukhruf", ayahs: 89 }, { id: 44, name: "Ad-Dukhan", ayahs: 59 }, { id: 45, name: "Al-Jathiyah", ayahs: 37 },
    { id: 46, name: "Al-Ahqaf", ayahs: 35 }, { id: 47, name: "Muhammad", ayahs: 38 }, { id: 48, name: "Al-Fath", ayahs: 29 },
    { id: 49, name: "Al-Hujurat", ayahs: 18 }, { id: 50, name: "Qaf", ayahs: 45 }, { id: 51, name: "Adh-Dhariyat", ayahs: 60 },
    { id: 52, name: "At-Tur", ayahs: 49 }, { id: 53, name: "An-Najm", ayahs: 62 }, { id: 54, name: "Al-Qamar", ayahs: 55 },
    { id: 55, name: "Ar-Rahman", ayahs: 78 }, { id: 56, name: "Al-Waqi'ah", ayahs: 96 }, { id: 57, name: "Al-Hadid", ayahs: 29 },
    { id: 58, name: "Al-Mujadila", ayahs: 22 }, { id: 59, name: "Al-Hashr", ayahs: 24 }, { id: 60, name: "Al-Mumtahanah", ayahs: 13 },
    { id: 61, name: "As-Saff", ayahs: 14 }, { id: 62, name: "Al-Jumu'ah", ayahs: 11 }, { id: 63, name: "Al-Munafiqun", ayahs: 11 },
    { id: 64, name: "At-Taghabun", ayahs: 18 }, { id: 65, name: "At-Talaq", ayahs: 12 }, { id: 66, name: "At-Tahrim", ayahs: 12 },
    { id: 67, name: "Al-Mulk", ayahs: 30 }, { id: 68, name: "Al-Qalam", ayahs: 52 }, { id: 69, name: "Al-Haqqah", ayahs: 52 },
    { id: 70, name: "Al-Ma'arij", ayahs: 44 }, { id: 71, name: "Nuh", ayahs: 28 }, { id: 72, name: "Al-Jinn", ayahs: 28 },
    { id: 73, name: "Al-Muzzammil", ayahs: 20 }, { id: 74, name: "Al-Muddaththir", ayahs: 56 }, { id: 75, name: "Al-Qiyamah", ayahs: 40 },
    { id: 76, name: "Al-Insan", ayahs: 31 }, { id: 77, name: "Al-Mursalat", ayahs: 50 }, { id: 78, name: "An-Naba", ayahs: 40 },
    { id: 79, name: "An-Nazi'at", ayahs: 46 }, { id: 80, name: "Abasa", ayahs: 42 }, { id: 81, name: "At-Takwir", ayahs: 29 },
    { id: 82, name: "Al-Infitar", ayahs: 19 }, { id: 83, name: "Al-Mutaffifin", ayahs: 36 }, { id: 84, name: "Al-Inshiqaq", ayahs: 25 },
    { id: 85, name: "Al-Buruj", ayahs: 22 }, { id: 86, name: "At-Tariq", ayahs: 17 }, { id: 87, name: "Al-A'la", ayahs: 19 },
    { id: 88, name: "Al-Ghashiyah", ayahs: 26 }, { id: 89, name: "Al-Fajr", ayahs: 30 }, { id: 90, name: "Al-Balad", ayahs: 20 },
    { id: 91, name: "Ash-Shams", ayahs: 15 }, { id: 92, name: "Al-Layl", ayahs: 21 }, { id: 93, name: "Ad-Duhaa", ayahs: 11 },
    { id: 94, name: "Ash-Sharh", ayahs: 8 }, { id: 95, name: "At-Tin", ayahs: 8 }, { id: 96, name: "Al-Alaq", ayahs: 19 },
    { id: 97, name: "Al-Qadr", ayahs: 5 }, { id: 98, name: "Al-Bayyinah", ayahs: 8 }, { id: 99, name: "Az-Zalzalah", ayahs: 8 },
    { id: 100, name: "Al-Adiyat", ayahs: 11 }, { id: 101, name: "Al-Qari'ah", ayahs: 11 }, { id: 102, name: "At-Takathur", ayahs: 8 },
    { id: 103, name: "Al-Asr", ayahs: 3 }, { id: 104, name: "Al-Humazah", ayahs: 9 }, { id: 105, name: "Al-Fil", ayahs: 5 },
    { id: 106, name: "Quraysh", ayahs: 4 }, { id: 107, name: "Al-Ma'un", ayahs: 7 }, { id: 108, name: "Al-Kawthar", ayahs: 3 },
    { id: 109, name: "Al-Kafirun", ayahs: 6 }, { id: 110, name: "An-Nasr", ayahs: 3 }, { id: 111, name: "Al-Masad", ayahs: 5 },
    { id: 112, name: "Al-Ikhlas", ayahs: 4 }, { id: 113, name: "Al-Falaq", ayahs: 5 }, { id: 114, name: "An-Nas", ayahs: 6 }
];
const TOTAL_AYAHS = SURAHS.reduce((sum, surah) => sum + surah.ayahs, 0);

// --- Main App Component ---
export default function App() {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [logs, setLogs] = useState([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Effect for handling authentication
    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Authentication Error:", error);
                }
            }
            setIsAuthReady(true);
        });
        return () => authUnsubscribe();
    }, []);

    // Effect for fetching data once authenticated
    useEffect(() => {
        if (!isAuthReady || !userId) return;

        setLoading(true);
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const q = query(collection(db, `/artifacts/${appId}/users/${userId}/memorization`));

        const dataUnsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedLogs = [];
            querySnapshot.forEach((doc) => {
                fetchedLogs.push({ id: doc.id, ...doc.data() });
            });
            setLogs(fetchedLogs);
            setLoading(false);
        }, (error) => {
            console.error("Firestore Snapshot Error:", error);
            setLoading(false);
        });

        return () => dataUnsubscribe();
    }, [isAuthReady, userId]);

    const addLog = async (log) => {
        if (!userId) return;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        try {
            const docRef = await addDoc(collection(db, `/artifacts/${appId}/users/${userId}/memorization`), {
                ...log,
                timestamp: new Date().toISOString()
            });
            console.log("Log added with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    if (!isAuthReady || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-green-500 animate-pulse" />
                    <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">Loading Your Progress...</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Please wait a moment.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Header onAddLog={() => setShowLogModal(true)} />
                <Dashboard logs={logs} />
                <MemorizationTable logs={logs} />
                {showLogModal && (
                    <LogMemorizationModal
                        onClose={() => setShowLogModal(false)}
                        onAddLog={addLog}
                    />
                )}
            </div>
        </div>
    );
}

// --- Sub-components ---

function Header({ onAddLog }) {
    return (
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
                <BookOpen className="w-8 h-8 text-green-500" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Qur'an Journey</h1>
            </div>
            <button
                onClick={onAddLog}
                className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
            >
                <Plus className="w-5 h-5 mr-2" />
                Log New Ayah
            </button>
        </header>
    );
}

function Dashboard({ logs }) {
    const stats = useMemo(() => {
        const masteredAyahs = logs.filter(log => log.status === 'Mastered').length;
        const reviewingAyahs = logs.filter(log => log.status === 'Reviewing').length;
        const newAyahs = logs.filter(log => log.status === 'New').length;
        const totalMemorized = logs.length;
        const percentage = totalMemorized > 0 ? ((totalMemorized / TOTAL_AYAHS) * 100).toFixed(2) : 0;
        
        const timeByDay = logs.reduce((acc, log) => {
            const date = new Date(log.timestamp).toLocaleDateString('en-CA');
            acc[date] = (acc[date] || 0) + log.timeSpent;
            return acc;
        }, {});
        
        const chartData = Object.entries(timeByDay).map(([date, time]) => ({ date, time })).slice(-7);

        return { masteredAyahs, reviewingAyahs, newAyahs, totalMemorized, percentage, chartData };
    }, [logs]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<CheckCircle className="text-green-500" />} title="Total Memorized" value={stats.totalMemorized} unit="Ayahs" />
            <StatCard icon={<Star className="text-yellow-500" />} title="Mastered" value={stats.masteredAyahs} />
            <StatCard icon={<Clock className="text-blue-500" />} title="Reviewing" value={stats.reviewingAyahs} />
            <StatCard icon={<BarChart2 className="text-purple-500" />} title="Progress" value={`${stats.percentage}%`} />
            
            <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 flex items-center"><Calendar className="mr-2" />Weekly Activity (Last 7 days)</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={stats.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="date" />
                            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: 'rgba(107, 114, 128, 0.5)',
                                    color: '#ffffff',
                                    borderRadius: '0.5rem'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="time" fill="#10B981" name="Time Spent (mins)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, unit }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:scale-105">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
                {React.cloneElement(icon, { className: "w-6 h-6" })}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{value} {unit}</p>
            </div>
        </div>
    );
}

function MemorizationTable({ logs }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    const filteredLogs = useMemo(() => {
        return logs
            .filter(log => {
                const surah = SURAHS.find(s => s.id === log.surah);
                const searchMatch = searchTerm === '' || 
                                    surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    log.ayah.toString().includes(searchTerm);
                const statusMatch = filterStatus === 'All' || log.status === filterStatus;
                return searchMatch && statusMatch;
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [logs, searchTerm, filterStatus]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-semibold">Memorization Log</h3>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Surah or Ayah..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                         className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="All">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Mastered">Mastered</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="p-4">Surah</th>
                            <th className="p-4">Ayah</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Time (mins)</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => {
                            const surah = SURAHS.find(s => s.id === log.surah);
                            return (
                                <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-medium">{surah ? `${surah.id}. ${surah.name}` : 'N/A'}</td>
                                    <td className="p-4">{log.ayah}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            log.status === 'Mastered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            log.status === 'Reviewing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="p-4">{log.timeSpent}</td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={log.notes}>{log.notes || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {filteredLogs.length === 0 && <p className="text-center p-8 text-gray-500">No logs found. Start by adding a new memorized ayah!</p>}
            </div>
        </div>
    );
}


function LogMemorizationModal({ onClose, onAddLog }) {
    const [surah, setSurah] = useState(1);
    const [ayah, setAyah] = useState('');
    const [status, setStatus] = useState('New');
    const [timeSpent, setTimeSpent] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const selectedSurah = SURAHS.find(s => s.id === parseInt(surah));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!surah || !ayah || !timeSpent) {
            setError('Please fill in all required fields.');
            return;
        }
        if (parseInt(ayah) <= 0 || parseInt(ayah) > selectedSurah.ayahs) {
            setError(`Ayah number must be between 1 and ${selectedSurah.ayahs} for ${selectedSurah.name}.`);
            return;
        }
        setError('');
        onAddLog({
            surah: parseInt(surah),
            ayah: parseInt(ayah),
            status,
            timeSpent: parseInt(timeSpent),
            notes
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all">
                <h2 className="text-2xl font-bold mb-6">Log New Memorization</h2>
                {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="surah" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Surah</label>
                        <select id="surah" value={surah} onChange={(e) => setSurah(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                            {SURAHS.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ayah" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ayah Number</label>
                        <input type="number" id="ayah" value={ayah} onChange={(e) => setAyah(e.target.value)} min="1" max={selectedSurah?.ayahs} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md">
                            <option>New</option>
                            <option>Reviewing</option>
                            <option>Mastered</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Spent (minutes)</label>
                        <input type="number" id="time" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} min="1" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500" />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes / Reflections</label>
                        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"></textarea>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add Log</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
