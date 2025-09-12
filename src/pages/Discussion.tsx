import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  Eye, 
  Clock,
  Tag,
  User,
  Send
} from 'lucide-react';
import { Discussion, discussionService } from '../services/discussionService';

const DiscussionPage: React.FC = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // New discussion form state
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    tags: [] as string[],
    author: 'Current User', // In real app, get from auth
    authorId: 'user123' // In real app, get from auth
  });

  useEffect(() => {
    try {
      const unsubscribe = discussionService.subscribeToDiscussions((discussionList) => {
        setDiscussions(discussionList);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase not configured, using mock data:', error);
      // Use mock data if Firebase is not configured
      setDiscussions(discussionService.getMockDiscussions());
      setLoading(false);
    }
  }, []);

  const handleCreateDiscussion = async () => {
    if (!newDiscussion.title || !newDiscussion.content) return;

    try {
      await discussionService.createDiscussion(newDiscussion);
      setNewDiscussion({
        title: '',
        content: '',
        category: 'general',
        tags: [],
        author: 'Current User',
        authorId: 'user123'
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Discussions', color: 'bg-gray-100' },
    { id: 'mapping', label: 'Code Mapping', color: 'bg-blue-100 text-blue-800' },
    { id: 'research', label: 'Research', color: 'bg-purple-100 text-purple-800' },
    { id: 'technical', label: 'Technical', color: 'bg-green-100 text-green-800' },
    { id: 'general', label: 'General', color: 'bg-orange-100 text-orange-800' }
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Community Discussions</h1>
              <p className="text-gray-600">Connect with healthcare professionals and researchers</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Discussion</span>
            </button>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-100 text-primary-800 border border-primary-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Create discussion modal */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCreateForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Start New Discussion</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={newDiscussion.title}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter discussion title..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                    <select
                      value={newDiscussion.category}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="general">General</option>
                      <option value="mapping">Code Mapping</option>
                      <option value="research">Research</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={newDiscussion.content}
                      onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts, questions, or insights..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateDiscussion}
                      disabled={!newDiscussion.title || !newDiscussion.content}
                      className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Post Discussion</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Discussions list */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading discussions...</p>
              </div>
            ) : filteredDiscussions.length > 0 ? (
              filteredDiscussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedDiscussion(discussion)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{discussion.title}</h3>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          categories.find(c => c.id === discussion.category)?.color || 'bg-gray-100'
                        }`}>
                          {categories.find(c => c.id === discussion.category)?.label}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2 text-sm sm:text-base">{discussion.content}</p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {discussion.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{discussion.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span className="hidden sm:inline">{discussion.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}</span>
                        <span className="sm:hidden">{discussion.createdAt?.toDate?.()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Now'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 sm:space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{discussion.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{discussion.replies?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{discussion.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No discussions found</h3>
                <p className="text-gray-500">Be the first to start a discussion!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DiscussionPage;