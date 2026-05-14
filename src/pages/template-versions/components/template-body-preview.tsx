import { Box, Text } from '@chakra-ui/react';
import DOMPurify from 'dompurify';

type TemplateBodyPreviewProps = {
  value: string;
  isHtml: boolean;
};

export const TemplateBodyPreview = ({ value, isHtml }: TemplateBodyPreviewProps) => {
  const sanitizedHtml = DOMPurify.sanitize(value, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
  });

  if (!isHtml) {
    return (
      <Box border='1px solid' borderColor='inputBorder' borderRadius='md' p='4'>
        <Text whiteSpace='pre-wrap'>{value || 'Pré-visualização do texto...'}</Text>
      </Box>
    );
  }

  return (
    <Box border='1px solid' borderColor='inputBorder' borderRadius='md' overflow='hidden'>
      <iframe
        title='HTML preview'
        srcDoc={sanitizedHtml}
        style={{
          width: '100%',
          height: '50vh',
          border: 'none',
          background: 'white',
        }}
        sandbox=''
      />
    </Box>
  );
};
