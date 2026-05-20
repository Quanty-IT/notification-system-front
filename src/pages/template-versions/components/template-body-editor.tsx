import { Box } from '@chakra-ui/react';
import { html } from '@codemirror/lang-html';
import CodeMirror from '@uiw/react-codemirror';

type TemplateBodyEditorProps = {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
};

export const TemplateBodyEditor = ({ value, onChange, hasError }: TemplateBodyEditorProps) => {
  return (
    <Box
      w='full'
      minH='20rem'
      border='1px solid'
      borderColor={hasError ? 'error' : 'inputBorder'}
      borderRadius='md'
      overflow='hidden'
      bg='white'
    >
      <CodeMirror
        value={value}
        height='20rem'
        extensions={[html()]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: true,
          closeBrackets: true,
        }}
        onChange={(nextValue) => {
          onChange(nextValue);
        }}
        placeholder='Digite um texto simples ou cole um HTML completo'
        style={{
          fontSize: '14px',
        }}
      />
    </Box>
  );
};
