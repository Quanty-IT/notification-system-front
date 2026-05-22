import { Button, Dialog, Field, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { AppSelect } from '@/shared/components';
import { inputStyle } from '../communication-form-shared';
import { RecipientDialogProps } from './types';

const recipientTypeOptions = [
  { label: 'To', value: 'to' },
  { label: 'Cc', value: 'cc' },
  { label: 'Bcc', value: 'bcc' },
];

export const RecipientDialog = ({
  open,
  isLoading,
  emailError,
  recipientTypeValue,
  emailRegister,
  onRecipientTypeChange,
  onClose,
  onSubmit,
}: RecipientDialogProps) => (
  <Dialog.Root open={open} onOpenChange={(details: { open: boolean }) => !details.open && onClose()}>
    <Dialog.Backdrop bg='blackAlpha.400' />

    <Dialog.Positioner>
      <Dialog.Content borderRadius='2xl' boxShadow='2xl' bg='surface' p='6'>
        <Dialog.Header px='0' pt='0' pb='4'>
          <Heading size='md' color='text'>
            Add Recipient
          </Heading>
        </Dialog.Header>

        <Dialog.CloseTrigger onClick={onClose} top='4' right='4' />

        <Dialog.Body px='0'>
          <Stack gap='4' py='4'>
            <Field.Root invalid={!!emailError} position='relative' pb='22px'>
              <Field.Label fontSize='sm' fontWeight='bold' color='primary'>
                Email Address
              </Field.Label>

              <Input {...emailRegister} placeholder='recipient@example.com' {...inputStyle} />

              {emailError && (
                <Text position='absolute' bottom='0' color='error' fontSize='xs'>
                  {emailError}
                </Text>
              )}
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize='sm' fontWeight='bold' color='primary'>
                Type
              </Field.Label>

              <AppSelect
                value={recipientTypeValue}
                options={recipientTypeOptions}
                onChange={onRecipientTypeChange}
                placeholder='Select recipient type...'
              />
            </Field.Root>
          </Stack>
        </Dialog.Body>

        <Dialog.Footer px='0' gap='3'>
          <Button
            variant='outline'
            borderColor='inputBorder'
            color='primary'
            fontWeight='bold'
            borderRadius='full'
            px={6}
            h='2.75rem'
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            bg='primary'
            color='white'
            fontWeight='bold'
            borderRadius='full'
            px={6}
            h='2.75rem'
            loading={isLoading}
            loadingText='Adding...'
            onClick={onSubmit}
          >
            Add Recipient
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
);
