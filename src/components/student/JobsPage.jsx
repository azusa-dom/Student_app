import React, { useState } from 'react';
import {
  Briefcase, Calendar, MapPin, FileText, 
  GraduationCap, Users, ExternalLink, BookOpen
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

const JobsPage = () => {
  const { jobFairs } = useAppContext();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('events');

  // UCL Careers Services集成链接
  const careerServices = [
    {
      id: 'job-board',
      title: t('jobs.services.jobBoard'),
      description: t('jobs.services.jobBoardDesc'),
      url: 'https://www.ucl.ac.uk/careers/opportunities/jobs-and-internships',
      icon: Briefcase
    },
    {
      id: 'cv-service',
      title: t('jobs.services.cvService'),
      description: t('jobs.services.cvServiceDesc'),
      url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/cvs-and-applications',
      icon: FileText
    },
    {
      id: 'career-consulting',
      title: t('jobs.services.careerConsulting'),
      description: t('jobs.services.careerConsultingDesc'),
      url: 'https://www.ucl.ac.uk/careers/about-us/appointments',
      icon: Users
    },
    {
      id: 'skills-workshops',
      title: t('jobs.services.workshops'),
      description: t('jobs.services.workshopsDesc'),
      url: 'https://www.ucl.ac.uk/careers/resources',
      icon: GraduationCap
    }
  ];

  // 学习资源
  const learningResources = [
    {
      id: 'interview-prep',
      title: t('jobs.resources.interviewPrep'),
      description: t('jobs.resources.interviewPrepDesc'),
      url: 'https://www.ucl.ac.uk/careers/applications-and-interviews/interviews'
    },
    {
      id: 'industry-insights',
      title: t('jobs.resources.industryInsights'),
      description: t('jobs.resources.industryInsightsDesc'),
      url: 'https://www.ucl.ac.uk/careers/resources/information-different-sectors'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 顶部导航标签 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex space-x-4 border-b">
          {['events', 'services', 'resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-2 ${
                activeTab === tab
                  ? 'border-b-2 border-purple-600 text-purple-600 font-medium'
                  : 'text-gray-600'
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
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {t('jobs.events.title')}
            </h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {careerServices.map(service => (
                <a
                  key={service.id}
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-purple-200 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                      <service.icon className="w-5 h-5 text-purple-600 group-hover:text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{service.title}</h3>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </div>
                  </div>
                </a>
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
            <div className="grid gap-4">
              {learningResources.map(resource => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-600">
                      <BookOpen className="w-5 h-5 text-purple-600 group-hover:text-white" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
