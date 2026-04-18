import React, { useEffect, useState } from 'react';
import { api } from '../../services/axios';
import { Send, History, Mail, MessageSquare, Monitor } from 'lucide-react';

// 1. Definição de Tipos Oficiais
interface Communication {
  id: string;
  title: string;
  type: 'Whatsapp' | 'Teams' | 'Email';
  recipients: string;
  status: 'Sent' | 'Scheduled' | 'Failed';
  timeline: string;
}

const MOCK_DATA: Communication[] = [
  { id: '1', title: 'Manutenção Programada', type: 'Email', recipients: 'Todos os funcionários', status: 'Sent', timeline: '2024-05-20 10:00' },
  { id: '2', title: 'Atualização de Segurança', type: 'Teams', recipients: 'Equipe de TI', status: 'Sent', timeline: '2024-05-20 09:30' },
  { id: '3', title: 'Lembrete de Reunião', type: 'Whatsapp', recipients: 'Gerentes', status: 'Scheduled', timeline: '2024-05-21 14:00' },
  { id: '4', title: 'Falha no Envio de Relatório', type: 'Email', recipients: 'financeiro@jd.com', status: 'Failed', timeline: '2024-05-19 18:00' },
];

const TypeIcon = ({ type }: { type: Communication['type'] }) => {
  const props = { size: 16, className: 'text-gray-500' };
  switch (type) {
    case 'Email': return <Mail {...props} />;
    case 'Whatsapp': return <MessageSquare {...props} />;
    case 'Teams': return <Monitor {...props} />;
    default: return null;
  }
};

const StatusBadge = ({ status }: { status: Communication['status'] }) => {
  const colors = {
    Sent: 'bg-green-100 text-green-800',
    Scheduled: 'bg-blue-100 text-blue-800',
    Failed: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold w-max ${colors[status]}`}>
      {status}
    </span>
  );
};

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/communications');
        setData(response.data);
      } catch (error) {
        console.error("Falha ao carregar dados da API. Usando dados mocados como fallback.", error);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Today', value: '128' },
    { label: 'Scheduled', value: '24' },
    { label: 'Templates', value: '12' },
  ];

  return (
    <div className="w-full overflow-x-hidden py-10 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-12">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-[#136906] text-white px-6 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg">
            <Send size={18} /> Send New
          </button>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all">
            <History size={18} /> History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#F4FBF4] p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center"
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
            <span className="mt-2 text-4xl font-black text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Timeline</h2>

        <div className="w-full overflow-x-auto max-w-full pb-4">
          <div className="grid grid-cols-5 gap-4 min-w-[800px] px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            <div>Title</div>
            <div>Channel</div>
            <div>Recipients</div>
            <div>Status</div>
            <div className="text-right">Date</div>
          </div>

          {loading ? (
            <div className="min-w-[800px] px-6 py-10 text-center text-gray-400">Loading records...</div>
          ) : (
            <div className="flex flex-col space-y-4 min-w-[800px]">
              {data.map((comm) => (
                <div
                  key={comm.id}
                  className="grid grid-cols-5 gap-4 min-w-[800px] items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-sm"
                >
                  <div className="truncate font-medium text-gray-800">{comm.title}</div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <TypeIcon type={comm.type} />
                    <span>{comm.type}</span>
                  </div>
                  <div className="truncate text-gray-500">{comm.recipients}</div>
                  <div>
                    <StatusBadge status={comm.status} />
                  </div>
                  <div className="text-right text-gray-500">{comm.timeline}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};