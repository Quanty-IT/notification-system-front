import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/axios'; // ← caminho real do seu axios
import type { Template } from './types';

export function useTemplates() {
  return useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: () => api.get('/templates').then((r) => r.data),
  });
}

export function useToggleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch(`/templates/${id}`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['templates'] }),
  });
}
