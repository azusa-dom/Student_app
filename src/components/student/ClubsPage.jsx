import React, { useMemo, useState } from 'react';
import { Search, Filter, Users, Calendar, MapPin, Star } from 'lucide-react';

const ClubsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'tech', label: '科技' },
    { id: 'art', label: '艺术' },
    { id: 'sports', label: '体育' },
    { id: 'volunteer', label: '志愿' },
  ];

  const clubs = [
    {
      id: 'cs-soc',
      name: '计算机科学协会',
      category: 'tech',
      members: 520,
      meetTime: '每周三 18:00',
      location: '工程楼 2F 多功能厅',
      description: '算法、AI、Web、项目实践与竞赛团队招募',
      tags: ['算法', 'AI', 'Web', 'Hackathon'],
      featured: true,
    },
    {
      id: 'photo',
      name: '摄影社',
      category: 'art',
      members: 180,
      meetTime: '每周五 19:30',
      location: '艺术中心 A103',
      description: '城市夜景、人像外拍与后期修图工作坊',
      tags: ['Lightroom', 'PS', '外拍'],
      featured: false,
    },
    {
      id: 'basketball',
      name: '篮球协会',
      category: 'sports',
      members: 260,
      meetTime: '每周二/四 17:00',
      location: '体育馆 主场地',
      description: '校队选拔、分组训练与友谊赛安排',
      tags: ['训练', '比赛'],
      featured: false,
    },
    {
      id: 'volunteer',
      name: '志愿者联盟',
      category: 'volunteer',
      members: 340,
      meetTime: '每周日 10:00',
      location: '学生活动中心 201',
      description: '社区服务、支教计划与公益活动组织',
      tags: ['社区', '公益', '支教'],
      featured: true,
    },
  ];

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchCategory = activeCategory === 'all' || club.category === activeCategory;
      const text = `${club.name} ${club.description} ${club.tags.join(' ')}`.toLowerCase();
      const matchSearch = text.includes(searchTerm.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [clubs, activeCategory, searchTerm]);

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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
      </div>

      {/* 社团列表 */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClubs.map((club) => (
          <div key={club.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {club.featured && (
              <div className="mb-3 inline-flex items-center px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-200">
                <Star className="w-3.5 h-3.5 mr-1" /> 推荐社团
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{club.name}</h3>
                <p className="text-gray-600 mt-1 line-clamp-2">{club.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {club.members}</div>
              <div className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> {club.meetTime}</div>
              <div className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {club.location}</div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {club.tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 text-xs border border-gray-200">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors">
                申请加入
              </button>
              <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                了解更多
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClubsPage;
