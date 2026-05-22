import { Badge } from '@chakra-ui/react';
import { CommunicationStatus } from '@/services/communications/types';
import { StatusBadgeProps } from './types';

const statusLabelMap: Record<CommunicationStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  processing: 'Processing',
  sent: 'Sent',
  failed: 'Failed',
  canceled: 'Canceled',
};

const statusStyles: Record<CommunicationStatus, { bg: string; color: string }> = {
  draft: { bg: 'gray.100', color: 'gray.700' },
  scheduled: { bg: 'blue.100', color: 'blue.800' },
  processing: { bg: 'purple.100', color: 'purple.800' },
  sent: { bg: 'green.100', color: 'green.800' },
  failed: { bg: 'red.100', color: 'red.800' },
  canceled: { bg: 'orange.100', color: 'orange.800' },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = statusStyles[status as CommunicationStatus] ?? {
    bg: status === 'sent' ? 'green.100' : 'red.100',
    color: status === 'sent' ? 'green.800' : 'red.800',
  };

  return (
    <Badge
      px='3'
      py='1'
      borderRadius='full'
      fontSize='xs'
      fontWeight='bold'
      textTransform='none'
      bg={styles.bg}
      color={styles.color}
    >
      {statusLabelMap[status as CommunicationStatus] ?? status}
    </Badge>
  );
};
