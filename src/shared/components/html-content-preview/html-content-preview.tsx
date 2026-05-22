import { Box, Text } from '@chakra-ui/react';
import DOMPurify from 'dompurify';
import { HtmlContentPreviewProps } from './types';

const hasHtmlTag = (value: string) => {
  return /<\/?[a-zA-Z][a-zA-Z0-9-]*(\s[^>]*)?>/i.test(value);
};

export const HtmlContentPreview = ({ value }: HtmlContentPreviewProps) => {
  const isHtml = hasHtmlTag(value);

  const sanitizedHtml = DOMPurify.sanitize(value, {
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover'],
  });

  if (!isHtml) {
    return (
      <Box border='1px solid' borderColor='inputBorder' borderRadius='md' p='4' bg='white' h='16rem' overflowY='auto'>
        <Text whiteSpace='pre-wrap' color={value ? 'text' : 'textSecondary'}>
          {value || 'Content preview will appear here...'}
        </Text>
      </Box>
    );
  }

  return (
    <Box border='1px solid' borderColor='inputBorder' borderRadius='md' overflow='hidden' bg='white' h='16rem'>
      <iframe
        title='HTML content preview'
        srcDoc={sanitizedHtml || '<p style="font-family:Arial;color:#777;">Content preview will appear here...</p>'}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'white',
        }}
        sandbox=''
      />
    </Box>
  );
};
