import { useState, useEffect } from 'react';
import { summarizeService } from '@/services';
import { Wifi, WifiOff, Cpu, Info, RefreshCw } from 'lucide-react';

/**
 * ServerStatus Component
 * Hiển thị trạng thái kết nối đến AI Server (Colab)
 * Check thủ công khi click
 */
const ServerStatus = () => {
    const [status, setStatus] = useState('checking'); // checking, connected, disconnected
    const [gpuInfo, setGpuInfo] = useState(null);
    const [lastCheck, setLastCheck] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkStatus = async () => {
        if (isChecking) return;

        setIsChecking(true);
        setStatus('checking');

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
            setIsChecking(false);
        }
    };

    useEffect(() => {
        // Initial check only
        checkStatus();
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
        if (status === 'checking') return 'Checking...';
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
            <div
                onClick={checkStatus}
                className="flex items-center justify-between group cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
                title="Click to check connection"
            >
                <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                        {status === 'connected' && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-500"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}></span>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-slate-300">
                            {getStatusText()}
                        </div>
                        {status === 'connected' && !isChecking && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Cpu className="w-3 h-3" />
                                {getGpuText()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Icon */}
                <div>
                    {isChecking ? (
                        <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                    ) : status === 'connected' ? (
                        <Wifi className="w-4 h-4 text-emerald-500/50" />
                    ) : (
                        <WifiOff className="w-4 h-4 text-red-500/50" />
                    )}
                </div>
            </div>

            {/* Last checked text */}
            {lastCheck && (
                <div className="text-[10px] text-slate-600 px-2 mt-1 flex justify-between">
                    <span>Click to refresh</span>
                    <span>{lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )}
        </div>
    );
};

export default ServerStatus;
