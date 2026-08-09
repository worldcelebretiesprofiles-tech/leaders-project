import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  link?: string;
  read_at: string | null;
  created_at: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await getMyNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      console.error("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative size-10 rounded-full flex items-center justify-center hover:bg-zinc-800 border border-zinc-800 transition bg-zinc-900"
      >
        <Bell className="size-5 text-zinc-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 size-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-zinc-950">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 overflow-hidden z-[100] flex flex-col max-h-[500px]">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
            <h3 className="font-semibold text-zinc-200 flex items-center gap-2">
              Notifications
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs font-medium text-blue-400">
                {unreadCount} New
              </span>
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-zinc-400 hover:text-blue-400 transition flex items-center gap-1"
              >
                <Check className="size-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="size-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3 border border-zinc-800">
                  <Bell className="size-6 text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-lg transition-colors group relative ${
                      !notif.read_at ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-zinc-800 border border-transparent'
                    }`}
                  >
                    {!notif.read_at && (
                      <div className="absolute top-4 left-3 size-2 rounded-full bg-blue-500" />
                    )}
                    <div className={`pl-${!notif.read_at ? '5' : '1'} pr-6`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${!notif.read_at ? 'text-zinc-200' : 'text-zinc-400'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        {notif.link && (
                          <a 
                            href={notif.link}
                            className="text-[11px] font-medium text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                          >
                            View details <ExternalLink className="size-3" />
                          </a>
                        )}
                        {!notif.read_at && (
                          <button 
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1"
                          >
                            <Check className="size-3" /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
