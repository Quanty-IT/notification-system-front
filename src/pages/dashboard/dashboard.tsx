import { useEffect, useState } from 'react';
import { api } from '../../services/axios';

export const Dashboard = () => {
  const [templates, setTemplates] = useState<{ id: string; name: string; description: string }[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const { data } = await api.get('/templates');
      setTemplates(data.templates);
    };

    fetchTemplates();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {templates.map((template) => (
          <li key={template.id}>
            <h3>{template.name}</h3>
            <p>{template.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
