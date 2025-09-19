import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, AlertTriangle, Info, X, Settings } from 'lucide-react';

const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'AI Mapping Completed',
      message: 'Successfully mapped 15 new NAMASTE codes to ICD-11 with 96% accuracy',
      timestamp: '2 minutes ago',
      read: false,
      priority: 'normal'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Low Confidence Mapping Detected',
      message: 'Patient diagnosis "complex Vata-Pitta disorder" needs manual review (confidence: 67%)',
      timestamp: '15 minutes ago',
      read: false,
      priority: 'high'
    },
    {
      id: 3,
      type: 'info',
      title: 'System Update Available',
      message: 'New version 2.1.0 includes improved Siddha medicine terminology support',
      timestamp: '1 hour ago',
      read: true,
      priority: 'normal'
    },
    {
      id: 4,
      type: 'success',
      title: 'Research Paper Published',
      message: 'Your research on "NAMASTE to ICD-11 Mapping Accuracy" has been published',
      timestamp: '3 hours ago',
      read: true,
      priority: 'normal'
    },
    {
      id: 5,
      type: 'warning',
      title: 'Database Sync Warning',
      message: 'WHO ICD-11 database sync encountered minor issues. Retrying automatically.',
      timestamp: '5 hours ago',
      read: false,
      priority: 'medium'
    },
    {
      id: 6,
      type: 'info',
      title: 'New Discussion Reply',
      message: 'Dr. Priya Sharma replied to your discussion about Unani medicine terminology',
      timestamp: '1 day ago',
      read: true,
      priority: 'low'
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-orange-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-blue-500';
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-4 sm:p-6 h-full overflow-y-auto bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">Stay updated with system activities and alerts</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {unreadCount} unread
            </span>
            <button 
              onClick={markAllAsRead}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Mark All Read
            </button>
            <button className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">AI Mapping Alerts</h3>
                  <p className="text-gray-600 text-sm">Get notified about mapping results</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">System Updates</h3>
                  <p className="text-gray-600 text-sm">Software updates and maintenance</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Discussion Replies</h3>
                  <p className="text-gray-600 text-sm">New replies to your discussions</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Security Alerts</h3>
                  <p className="text-gray-600 text-sm">Important security notifications</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-6 border-l-4 border-r border-t border-b border-gray-200 shadow-sm ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{notification.timestamp}</span>
                      <span className="capitalize">Priority: {notification.priority}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Delete notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NotificationsPanel;