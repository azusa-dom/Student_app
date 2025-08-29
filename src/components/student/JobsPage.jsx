import React, { useState } from 'react';
import {
  Briefcase, Calendar, MapPin, FileText, 
  GraduationCap, Users, ExternalLink, BookOpen,
  Search, Building, Target, Lightbulb
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

const JobsPage = () => {
  const { jobFairs } = useAppContext();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('events');

  // UCL Careers Services - 精确链接对应
  const careerServices = [
    {
      id: 'job-board',
      title: t('jobs.services.jobBoard'),
      description: t('jobs.services.jobBoardDesc'),
      url: 'https://www.ucl.ac.uk/careers/opportunities/jobs-and-internships',
      icon: Briefcase,
      subServices: [
        {
          name: '毕业生工作',
          url: 'https://www.ucl.ac.uk/careers/opportunities/graduate-jobs'
        },
        {
          name: '实习机会',
          url: 'https://www.ucl.ac.uk/careers/opportunities/internships'
        },
        {
          name: '兼职工作',
          url: 'https://www.ucl.ac.uk/careers/opportunities/part-time-jobs'
        },
        {
          name: '志愿工作',
          url: 'https://www.ucl.ac.uk/careers/opportunities/volunteer-work'
        }
      ]
    },
    {
      id: 'cv-service',
      title: t('jobs.services.cvService'),
      description: t('jobs.services.cvServiceDesc'),
      url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/cvs-and-applications',
      icon: FileText,
      subServices: [
        {
          name: '求职信写作',
          url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/cover-letters'
        },
        {
          name: '申请表填写',
          url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/application-forms'
        },
        {
          name: 'LinkedIn优化',
          url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/linkedin'
        }
      ]
    },
    {
      id: 'career-consulting',
      title: t('jobs.services.careerConsulting'),
      description: t('jobs.services.careerConsultingDesc'),
      url: 'https://www.ucl.ac.uk/careers/about-us/appointments',
      icon: Users,
      subServices: [
        {
          name: '预约职业指导',
          url: 'https://www.ucl.ac.uk/careers/about-us/appointments/book-appointment'
        },
        {
          name: '职业规划建议',
          url: 'https://www.ucl.ac.uk/careers/about-us/careers-advice'
        }
      ]
    },
    {
      id: 'skills-workshops',
      title: t('jobs.services.workshops'),
      description: t('jobs.services.workshopsDesc'),
      url: 'https://www.ucl.ac.uk/careers/events',
      icon: GraduationCap,
      subServices: [
        {
          name: '技能发展工作坊',
          url: 'https://www.ucl.ac.uk/careers/events/workshops'
        },
        {
          name: '雇主活动',
          url: 'https://www.ucl.ac.uk/careers/events/employer-events'
        },
        {
          name: '职业博览会',
          url: 'https://www.ucl.ac.uk/careers/events/careers-fairs'
        },
        {
          name: '网络活动',
          url: 'https://www.ucl.ac.uk/careers/events/networking'
        }
      ]
    }
  ];

  // 学习资源 - 更新链接
  const learningResources = [
    {
      id: 'interview-prep',
      title: t('jobs.resources.interviewPrep'),
      description: t('jobs.resources.interviewPrepDesc'),
      url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews/interview-preparation',
      icon: Target,
      subResources: [
        {
          name: '面试技巧',
          url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews/interview-preparation'
        },
        {
          name: '评估中心',
          url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews/assessment-centres'
        },
        {
          name: '视频面试',
          url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews/video-interviews'
        }
      ]
    },
    {
      id: 'industry-insights',
      title: t('jobs.resources.industryInsights'),
      description: t('jobs.resources.industryInsightsDesc'),
      url: 'https://www.ucl.ac.uk/careers/resources/information-different-sectors',
      icon: Building,
      subResources: [
        {
          name: '会计与金融',
          url: 'https://www.ucl.ac.uk/careers/resources/information-different-sectors/accounting-and-finance'
        },
        {
          name: '咨询行业',
          url: 'https://www.ucl.ac.uk/careers/resources/information-different-sectors/consulting'
        },
        {
          name: '科技行业',
          url: 'https://www.ucl.ac.uk/careers/resources/information-different-sectors/technology'
        },
        {
          name: '医疗健康',
          url: 'https://www.ucl.ac.uk/careers/resources/information-different-sectors/healthcare'
        },
        {
          name: '教育行业',
          url: 'https://www.ucl.ac.uk/careers/resources/information-different-sectors/education'
        },
        {
          name: '研发科研',
          url: 'https://www.ucl.ac.uk/careers/resources/information-different-sectors/research-and-development'
        }
      ]
    },
    {
      id: 'career-planning',
      title: '职业规划',
      description: '长期职业发展规划和自我评估工具',
      url: 'https://www.ucl.ac.uk/careers/resources/career-planning',
      icon: Lightbulb
    },
    {
      id: 'skills-development',
      title: '技能发展',
      description: '提升就业能力的核心技能培训',
      url: 'https://www.ucl.ac.uk/careers/resources/skills-development',
      icon: BookOpen
    }
  ];

  // 额外的UCL Careers快捷入口
  const quickAccessLinks = [
    {
      id: 'main-careers-site',
      title: 'UCL Careers 主页',
      description: '访问完整的职业服务网站',
      url: 'https://www.ucl.ac.uk/careers/',
      icon: ExternalLink
    },
    {
      id: 'job-search',
      title: '工作搜索引擎',
      description: '直接搜索适合的工作机会',
      url: 'https://www.ucl.ac.uk/careers/opportunities',
      icon: Search
    }
  ];

  return (
    <div className="space-y-6">
      {/* 快捷访问栏 */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">UCL Careers 快捷访问</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickAccessLinks.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg p-3 hover:bg-opacity-30 transition-all"
            >
              <link.icon className="w-5 h-5" />
              <div>
                <h3 className="font-medium">{link.title}</h3>
                <p className="text-sm text-purple-100">{link.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 顶部导航标签 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex space-x-4 border-b">
          {['events', 'services', 'resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-2 transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-purple-600 text-purple-600 font-medium'
                  : 'text-gray-600 hover:text-purple-500'
              }`}
            >
              {t(`jobs.tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {/* 招聘会和活动 */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {t('jobs.events.title')}
              </h2>
              <a
                href="https://www.ucl.ac.uk/careers/events"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 text-sm flex items-center space-x-1"
              >
                <span>查看更多活动</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="grid gap-4">
              {jobFairs.map(fair => (
                <div key={fair.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{fair.title}</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {fair.date}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {fair.location}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {fair.companies.map((company, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded">
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                      {t('jobs.events.register')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UCL职业服务 */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {t('jobs.services.title')}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {careerServices.map(service => (
                <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  {/* 主服务链接 */}
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start space-x-4 group mb-4"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <service.icon className="w-6 h-6 text-purple-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">{service.title}</h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </div>
                  </a>
                  
                  {/* 子服务链接 */}
                  {service.subServices && (
                    <div className="pl-4 border-l-2 border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">相关服务:</h4>
                      <div className="space-y-2">
                        {service.subServices.map((subService, idx) => (
                          <a
                            key={idx}
                            href={subService.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-gray-600 hover:text-purple-600 hover:underline"
                          >
                            • {subService.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 学习资源 */}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {t('jobs.resources.title')}
            </h2>
            <div className="grid gap-6">
              {learningResources.map(resource => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  {/* 主资源链接 */}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between group mb-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                        <resource.icon className="w-6 h-6 text-purple-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                  </a>

                  {/* 子资源链接 */}
                  {resource.subResources && (
                    <div className="pl-4 border-l-2 border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">详细资源:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {resource.subResources.map((subResource, idx) => (
                          <a
                            key={idx}
                            href={subResource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 hover:text-purple-600 hover:underline p-2 rounded bg-gray-50 hover:bg-purple-50 transition-colors"
                          >
                            {subResource.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
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