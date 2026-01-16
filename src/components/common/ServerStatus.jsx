import { useState, useEffect } from 'react';
import { summarizeService } from '@/services';
import { Wifi, WifiOff, Cpu, Info } from 'lucide-react';

/**
 * ServerStatus Component
 * Hiển thị trạng thái kết nối đến AI Server (Colab)
 * Tự động ping mỗi 60s
 */
const ServerStatus = () => {
    const [status, setStatus] = useState('checking'); // checking, connected, disconnected
    const [gpuInfo, setGpuInfo] = useState(null);
    const [lastCheck, setLastCheck] = useState(null);

    const checkStatus = async () => {
        try {
            const data = await summarizeService.health();
            if (data.status === 'connected') {
                setStatus('connected');
                setGpuInfo(data.gpu_available);
            } else {
                setStatus('disconnected');
            }
        } catch (error) {
            setStatus('disconnected');
            console.error('Server status check failed:', error);
        } finally {
            setLastCheck(new Date());
        }
    };

    useEffect(() => {
        // Check immediately
        checkStatus();

        // Check every 60s
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    // Render logic
    const getStatusColor = () => {
        switch (status) {
            case 'connected': return 'bg-emerald-500';
            case 'disconnected': return 'bg-red-500';
            default: return 'bg-amber-500'; // checking
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'connected': return 'AI Server Online';
            case 'disconnected': return 'AI Server Offline';
            default: return 'Checking Server...';
        }
    };

    const getGpuText = () => {
        if (!gpuInfo) return 'GPU Info Unavailable';
        return `GPU: ${typeof gpuInfo === 'string' ? gpuInfo : 'Available'}`;
    };

    return (
        <div className="px-4 py-3 border-t border-slate-800/50">
            <div className="flex items-center justify-between group cursor-help">
                <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusColor()}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-300">
                            {getStatusText()}
                        </div>
                        {status === 'connected' && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Cpu className="w-3 h-3" />
                                {getGpuText()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Icon */}
                <div>
                    {status === 'connected' ? (
                        <Wifi className="w-4 h-4 text-emerald-500/50" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-red-500/50" />
                    )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-4 mb-2 hidden group-hover:block w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-3 text-xs text-slate-300 z-50">
                    <div className="font-semibold text-white mb-1 flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        Server Status Info
                    </div>
                    <div className="space-y-1">
                        <p>Connection: {status === 'connected' ? 'Stable' : 'Lost'}</p>
                        {lastCheck && <p>Last checked: {lastCheck.toLocaleTimeString()}</p>}
                        {status === 'disconnected' && (
                            <p className="text-red-400 mt-1">
                                Backend cannot reach Colab. Please check if Colab notebook is running and updated.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServerStatus;
