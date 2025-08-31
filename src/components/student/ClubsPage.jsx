import React, { useMemo, useState, useEffect } from 'react';
import { Search, Filter, Users, Calendar, MapPin, Star, RefreshCw, ExternalLink } from 'lucide-react';
import { activityService } from '../../services/ActivityService';
import { useTheme } from '../../contexts/ThemeContext';

const ClubsPage = () => {
  const { getThemeConfig } = useTheme();
  const themeConfig = getThemeConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activities, setActivities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'club', label: '学生会' },
    { id: 'career', label: '职业' },
    { id: 'event', label: '官方活动' },
    { id: 'cultural', label: '文化' },
    { id: 'academic', label: '学术' },
    { id: 'sports', label: '体育' },
    { id: 'social', label: '社交' },
  ];
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await activityService.getAllActivities();
        setActivities(res.activities || []);
        setLastUpdated(res.lastUpdated || '');
      } catch (e) {
        setError('活动加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onRefresh = async () => {
    setLoading(true);
    await activityService.refreshServerCache();
    const res = await activityService.getAllActivities(true);
    setActivities(res.activities || []);
    setLastUpdated(res.lastUpdated || '');
    setLoading(false);
  };

  const filteredActivities = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return (activities || []).filter((act) => {
      const matchCategory =
        activeCategory === 'all' ||
        act.type === activeCategory ||
        act.category === activeCategory;
      const hay = `${act.title || ''} ${act.description || ''} ${act.location || ''}`.toLowerCase();
      const matchSearch = !keyword || hay.includes(keyword);
      return matchCategory && matchSearch;
    });
  }, [activities, activeCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 顶部标题 */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold mb-2">学生社团中心</h1>
          <p className="text-indigo-100 text-lg">发现兴趣同好，加入社团，拓展你的校园生活</p>
        </div>
      </div>

      {/* 搜索与筛选 */}
      <div className={`${themeConfig.card} rounded-2xl p-6 shadow-sm border border-white/50`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div className="lg:col-span-2">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 outline-none text-gray-900 placeholder-gray-400"
                placeholder="搜索社团、关键词或标签..."
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-gray-500">{lastUpdated ? `上次更新：${new Date(lastUpdated).toLocaleString('zh-CN')}` : ''}</div>
          <button onClick={onRefresh} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 刷新
          </button>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && (
          <div className="col-span-full text-center text-gray-500">正在加载活动…</div>
        )}
        {!loading && filteredActivities.length === 0 && (
          <div className="col-span-full text-center text-gray-500">暂无匹配的活动</div>
        )}
        {filteredActivities.map((act) => (
          <div key={act.id} className={`${themeConfig.card} rounded-2xl p-6 border border-white/50 hover:shadow-md transition-shadow`}>
            <div className="mb-3 inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200">
              <Star className="w-3.5 h-3.5 mr-1" /> {act.type === 'club' ? '学生会' : act.type === 'career' ? '职业' : '官方活动'}
            </div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{act.title}</h3>
                <p className="text-gray-600 mt-1 line-clamp-2">{act.description}</p>
              </div>
              {act.url && (
                <a href={act.url} target="_blank" rel="noreferrer" className="ml-3 p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="前往链接">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {act.date} {act.time && `· ${act.time}`}</div>
              <div className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {act.location || '待定'}</div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {act.category && (
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 text-xs border border-gray-200">#{act.category}</span>
              )}
              {act.organizer && (
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 text-xs border border-gray-200">{act.organizer}</span>
              )}
              {act.source && (
                <span className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 text-xs border border-gray-200">来源: {act.source}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubsPage;
