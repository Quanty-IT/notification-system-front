import { Field, Input, Text } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import { Controller } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import { CommunicationFormCard, inputStyle } from '../communication-form-shared/communication-form-shared';
import { DeliveryCardProps, DeliveryFormValues } from './types';

export const DeliveryCard = <T extends DeliveryFormValues>({ control, errors, disabled }: DeliveryCardProps<T>) => {
  return (
    <CommunicationFormCard title='Delivery'>
      <Field.Root invalid={!!errors.scheduledAt}>
        <Field.Label mb={1} color='primary' fontWeight='bold' fontSize='sm'>
          Schedule for later
        </Field.Label>

        <Controller
          name={'scheduledAt' as never}
          control={control}
          render={({ field }) => (
            <DatePicker
              selected={field.value ?? null}
              onChange={(date: Date | null) => field.onChange(date)}
              showTimeSelect
              timeIntervals={5}
              dateFormat='dd/MM/yyyy HH:mm'
              placeholderText='Select date and time'
              minDate={new Date()}
              disabled={disabled}
              wrapperClassName='full-width-datepicker'
              popperClassName='datepicker-popper'
              portalId='root-portal'
              customInput={
                <Input
                  {...inputStyle}
                  h='3rem'
                  borderRadius='xl'
                  cursor='pointer'
                  readOnly
                  _readOnly={{ cursor: 'pointer' }}
                  _focus={{
                    borderColor: 'primary',
                    boxShadow: '0 0 0 1px var(--chakra-colors-primary)',
                    outline: 'none',
                  }}
                  _focusVisible={{
                    borderColor: 'primary',
                    boxShadow: '0 0 0 1px var(--chakra-colors-primary)',
                    outline: 'none',
                  }}
                />
              }
            />
          )}
        />

        {errors.scheduledAt && (
          <Text color='error' fontSize='xs' mt='2'>
            {String(errors.scheduledAt.message)}
          </Text>
        )}

        <Text fontSize='xs' color='textSecondary' mt='3'>
          Leave blank to send immediately, or choose a date and time to schedule.
        </Text>
      </Field.Root>
    </CommunicationFormCard>
  );
};
