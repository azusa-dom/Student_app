import React, { useState } from "react";

const JobsPage = () => {
  const [activeTab, setActiveTab] = useState("services");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim()) {
      window.open(
        `https://www.ucl.ac.uk/careers/opportunities?search=${encodeURIComponent(
          searchTerm
        )}`,
        "_blank"
      );
    }
  };

  const tabs = [
    { id: "services", label: "核心服务" },
    { id: "events", label: "活动博览" },
    { id: "resources", label: "学习资源" },
    { id: "special", label: "专项支持" },
  ];

  return (
    <div className="container mx-auto max-w-[1200px] p-5 font-sans bg-gradient-to-br from-slate-50 to-slate-200 min-h-screen text-gray-900">
      {/* 头部区域 */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-white mb-8 bg-gradient-to-r from-indigo-500 to-purple-600">
        <div className="absolute -top-1/2 -right-1/5 w-[300px] h-[300px] bg-white/10 rounded-full"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-white/90 to-white bg-clip-text text-transparent">
            UCL 职业服务中心
          </h1>
          <p className="text-lg opacity-90 mb-6">
            全方位职业发展支持，助力你的未来职业之路
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { number: "500+", label: "合作雇主" },
              { number: "95%", label: "就业率" },
              { number: "1000+", label: "年度活动" },
              { number: "24/7", label: "在线支持" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-4 bg-white/20 rounded-2xl backdrop-blur"
              >
                <span className="block text-2xl font-bold">{stat.number}</span>
                <span className="text-sm opacity-80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-2xl p-5 mb-8 shadow-lg border border-gray-100">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            className="flex-1 min-w-[250px] px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="搜索职位、公司、行业或技能..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:-translate-y-1 hover:shadow-lg transition"
          >
            🔍 搜索机会
          </button>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="bg-white rounded-2xl p-2 mb-8 shadow-lg flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div>
        {activeTab === "services" && (
          <div className="grid gap-6 sm:grid-cols-2">
            {/* 示例服务卡片 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:-translate-y-1 hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-xl text-white">
                  💼
                </div>
                <div>
                  <h3 className="font-bold text-lg">工作与实习机会</h3>
                  <p className="text-sm text-gray-500">
                    探索全球顶尖企业的工作和实习机会
                  </p>
                </div>
              </div>
              <a
                href="https://www.ucl.ac.uk/careers/opportunities"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-2 mb-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:-translate-y-0.5 hover:shadow transition"
              >
                🚀 浏览所有机会
              </a>
              <div className="grid gap-2">
                <a
                  href="https://www.ucl.ac.uk/careers/opportunities/jobs-and-internships"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3 py-2 rounded-md text-sm bg-gray-50 border-l-4 border-gray-200 text-gray-600 hover:bg-indigo-500 hover:text-white hover:border-indigo-600 transition"
                >
                  工作与实习
                </a>
                <a
                  href="https://www.ucl.ac.uk/careers/opportunities/graduate-jobs"
                  target="_blank"
                  rel="noreferrer"
                  className="block px-3 py-2 rounded-md text-sm bg-gray-50 border-l-4 border-gray-200 text-gray-600 hover:bg-indigo-500 hover:text-white hover:border-indigo-600 transition"
                >
                  毕业生职位
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid gap-6 sm:grid-cols-2">
            {/* 示例活动卡片 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-xl transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center text-2xl text-white">
                  🏢
                </div>
                <div>
                  <h3 className="text-lg font-bold">春季职业博览会</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                    <span>📅 2024年3月15日</span>
                    <span>📍 UCL主校区</span>
                    <span>⏰ 10:00-16:00</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Google", "Microsoft", "Goldman Sachs", "BCG", "+50家企业"].map(
                  (c, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600 font-medium"
                    >
                      {c}
                    </span>
                  )
                )}
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:-translate-y-0.5 hover:shadow transition">
                  🎯 立即报名
                </button>
                <a
                  href="https://www.ucl.ac.uk/careers/fairs"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-gray-600 border border-gray-200 bg-gray-50 hover:bg-gray-100 transition"
                >
                  📋 查看详情
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === "resources" && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg border hover:-translate-y-1 hover:shadow-xl transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-xl text-white">
                  🧠
                </div>
                <div>
                  <h3 className="font-bold text-lg">技能发展中心</h3>
                  <p className="text-sm text-gray-500">
                    提升核心技能，增强就业竞争力
                  </p>
                </div>
              </div>
              <a
                href="https://www.ucl.ac.uk/careers/resources"
                target="_blank"
                rel="noreferrer"
                className="inline-block px-4 py-2 mb-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:-translate-y-0.5 hover:shadow transition"
              >
                📚 技能提升
              </a>
            </div>
          </div>
        )}

        {activeTab === "special" && (
          <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-800 text-center mb-6">
              专项支持服务
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "🌍", title: "国际学生支持" },
                { icon: "♿", title: "无障碍就业服务" },
                { icon: "🎓", title: "研究生职业发展" },
                { icon: "💡", title: "创业孵化项目" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-xl text-center shadow hover:-translate-y-1 hover:shadow-md transition"
                >
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-xl text-white">
                    {s.icon}
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
