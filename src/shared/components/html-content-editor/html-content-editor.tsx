import { Box } from '@chakra-ui/react';
import { autocompletion, CompletionContext, snippetCompletion } from '@codemirror/autocomplete';
import { html } from '@codemirror/lang-html';
import CodeMirror from '@uiw/react-codemirror';
import type { HtmlContentEditorProps } from './types';

const htmlSnippets = [
  snippetCompletion(
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${1:Title}</title>\n</head>\n<body>\n  ${2}\n</body>\n</html>',
    {
      label: '!',
      detail: 'HTML boilerplate',
      type: 'keyword',
    },
  ),

  snippetCompletion(
    '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${1:Title}</title>\n</head>\n<body style="margin:0; padding:0; background-color:#f4f7fb; font-family:Arial, Helvetica, sans-serif;">\n  ${2}\n</body>\n</html>',
    {
      label: 'email',
      detail: 'Email HTML base',
      type: 'keyword',
    },
  ),

  snippetCompletion('{{${1:name}}}', {
    label: '{{',
    detail: 'Template variable',
    type: 'variable',
  }),

  snippetCompletion('{{name}}', {
    label: 'var:name',
    detail: 'Name variable',
    type: 'variable',
  }),

  snippetCompletion('{{company}}', {
    label: 'var:company',
    detail: 'Company variable',
    type: 'variable',
  }),

  snippetCompletion('{{link}}', {
    label: 'var:link',
    detail: 'Link variable',
    type: 'variable',
  }),

  snippetCompletion('{{year}}', {
    label: 'var:year',
    detail: 'Year variable',
    type: 'variable',
  }),

  snippetCompletion('<h1>${1}</h1>', {
    label: 'h1',
    detail: 'Heading 1',
    type: 'keyword',
  }),

  snippetCompletion('<h2>${1}</h2>', {
    label: 'h2',
    detail: 'Heading 2',
    type: 'keyword',
  }),

  snippetCompletion('<h3>${1}</h3>', {
    label: 'h3',
    detail: 'Heading 3',
    type: 'keyword',
  }),

  snippetCompletion('<h4>${1}</h4>', {
    label: 'h4',
    detail: 'Heading 4',
    type: 'keyword',
  }),

  snippetCompletion('<h5>${1}</h5>', {
    label: 'h5',
    detail: 'Heading 5',
    type: 'keyword',
  }),

  snippetCompletion('<h6>${1}</h6>', {
    label: 'h6',
    detail: 'Heading 6',
    type: 'keyword',
  }),

  snippetCompletion('<p>${1}</p>', {
    label: 'p',
    detail: 'Paragraph',
    type: 'keyword',
  }),

  snippetCompletion('<span>${1}</span>', {
    label: 'span',
    detail: 'Span',
    type: 'keyword',
  }),

  snippetCompletion('<div>${1}</div>', {
    label: 'div',
    detail: 'Division',
    type: 'keyword',
  }),

  snippetCompletion('<strong>${1}</strong>', {
    label: 'strong',
    detail: 'Strong text',
    type: 'keyword',
  }),

  snippetCompletion('<b>${1}</b>', {
    label: 'b',
    detail: 'Bold text',
    type: 'keyword',
  }),

  snippetCompletion('<em>${1}</em>', {
    label: 'em',
    detail: 'Emphasis',
    type: 'keyword',
  }),

  snippetCompletion('<i>${1}</i>', {
    label: 'i',
    detail: 'Italic text',
    type: 'keyword',
  }),

  snippetCompletion('<small>${1}</small>', {
    label: 'small',
    detail: 'Small text',
    type: 'keyword',
  }),

  snippetCompletion('<br />', {
    label: 'br',
    detail: 'Line break',
    type: 'keyword',
  }),

  snippetCompletion('<hr />', {
    label: 'hr',
    detail: 'Horizontal rule',
    type: 'keyword',
  }),

  snippetCompletion('<a href="${1:https://example.com}" target="_blank">${2}</a>', {
    label: 'a',
    detail: 'Anchor',
    type: 'keyword',
  }),

  snippetCompletion('<img src="${1}" alt="${2}" style="max-width:100%; height:auto;" />', {
    label: 'img',
    detail: 'Image',
    type: 'keyword',
  }),

  snippetCompletion('<ul>\n  <li>${1}</li>\n</ul>', {
    label: 'ul',
    detail: 'Unordered list',
    type: 'keyword',
  }),

  snippetCompletion('<ol>\n  <li>${1}</li>\n</ol>', {
    label: 'ol',
    detail: 'Ordered list',
    type: 'keyword',
  }),

  snippetCompletion('<li>${1}</li>', {
    label: 'li',
    detail: 'List item',
    type: 'keyword',
  }),

  snippetCompletion('<table>\n  <tr>\n    <td>${1}</td>\n  </tr>\n</table>', {
    label: 'table',
    detail: 'Table',
    type: 'keyword',
  }),

  snippetCompletion(
    '<table width="100%" cellpadding="0" cellspacing="0" border="0">\n  <tr>\n    <td>${1}</td>\n  </tr>\n</table>',
    {
      label: 'email:table',
      detail: 'Email table',
      type: 'keyword',
    },
  ),

  snippetCompletion('<tr>\n  <td>${1}</td>\n</tr>', {
    label: 'tr',
    detail: 'Table row',
    type: 'keyword',
  }),

  snippetCompletion('<td>${1}</td>', {
    label: 'td',
    detail: 'Table cell',
    type: 'keyword',
  }),

  snippetCompletion('<th>${1}</th>', {
    label: 'th',
    detail: 'Table header cell',
    type: 'keyword',
  }),

  snippetCompletion('<thead>\n  <tr>\n    <th>${1}</th>\n  </tr>\n</thead>', {
    label: 'thead',
    detail: 'Table head',
    type: 'keyword',
  }),

  snippetCompletion('<tbody>\n  <tr>\n    <td>${1}</td>\n  </tr>\n</tbody>', {
    label: 'tbody',
    detail: 'Table body',
    type: 'keyword',
  }),

  snippetCompletion('<section>${1}</section>', {
    label: 'section',
    detail: 'Section',
    type: 'keyword',
  }),

  snippetCompletion('<header>${1}</header>', {
    label: 'header',
    detail: 'Header',
    type: 'keyword',
  }),

  snippetCompletion('<main>${1}</main>', {
    label: 'main',
    detail: 'Main',
    type: 'keyword',
  }),

  snippetCompletion('<footer>${1}</footer>', {
    label: 'footer',
    detail: 'Footer',
    type: 'keyword',
  }),

  snippetCompletion('<article>${1}</article>', {
    label: 'article',
    detail: 'Article',
    type: 'keyword',
  }),

  snippetCompletion('<nav>${1}</nav>', {
    label: 'nav',
    detail: 'Navigation',
    type: 'keyword',
  }),

  snippetCompletion('<aside>${1}</aside>', {
    label: 'aside',
    detail: 'Aside',
    type: 'keyword',
  }),

  snippetCompletion('<style>\n  ${1}\n</style>', {
    label: 'style',
    detail: 'Style block',
    type: 'keyword',
  }),

  snippetCompletion('style="${1}"', {
    label: 'style:',
    detail: 'Inline style attribute',
    type: 'property',
  }),

  snippetCompletion('class="${1}"', {
    label: 'class',
    detail: 'Class attribute',
    type: 'property',
  }),

  snippetCompletion('id="${1}"', {
    label: 'id',
    detail: 'ID attribute',
    type: 'property',
  }),

  snippetCompletion('href="${1}"', {
    label: 'href',
    detail: 'Href attribute',
    type: 'property',
  }),

  snippetCompletion('src="${1}"', {
    label: 'src',
    detail: 'Source attribute',
    type: 'property',
  }),

  snippetCompletion('alt="${1}"', {
    label: 'alt',
    detail: 'Alt attribute',
    type: 'property',
  }),

  snippetCompletion('target="_blank"', {
    label: 'target',
    detail: 'Open link in new tab',
    type: 'property',
  }),

  snippetCompletion(
    '<a href="${1:{{link}}}" target="_blank" style="display:inline-block; padding:14px 28px; font-size:15px; font-weight:bold; color:#ffffff; background-color:#2f855a; border-radius:8px; text-decoration:none;">${2:Click here}</a>',
    {
      label: 'button',
      detail: 'Email button link',
      type: 'keyword',
    },
  ),

  snippetCompletion(
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fb; padding:30px 0;">\n  <tr>\n    <td align="center">\n      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden;">\n        <tr>\n          <td style="padding:30px;">\n            ${1}\n          </td>\n        </tr>\n      </table>\n    </td>\n  </tr>\n</table>',
    {
      label: 'email:container',
      detail: 'Centered email container',
      type: 'keyword',
    },
  ),

  snippetCompletion('<tr>\n  <td style="padding:${1:20px};">\n    ${2}\n  </td>\n</tr>', {
    label: 'email:row',
    detail: 'Email table row',
    type: 'keyword',
  }),

  snippetCompletion('<td align="${1:center}" style="${2}">${3}</td>', {
    label: 'email:td',
    detail: 'Email table cell',
    type: 'keyword',
  }),
];

const htmlSnippetCompletionSource = (context: CompletionContext) => {
  const word = context.matchBefore(/[a-zA-Z0-9!:{]+/);

  if (!word) return null;

  if (word.from === word.to && !context.explicit) {
    return null;
  }

  return {
    from: word.from,
    options: htmlSnippets,
  };
};

export const HtmlContentEditor = ({ value, onChange, hasError }: HtmlContentEditorProps) => {
  return (
    <Box
      w='full'
      minH='20rem'
      border='1px solid'
      borderColor={hasError ? 'error' : 'inputBorder'}
      borderRadius='md'
      overflow='hidden'
      bg='inputBg'
    >
      <CodeMirror
        value={value}
        height='20rem'
        extensions={[
          html(),
          autocompletion({
            override: [htmlSnippetCompletionSource],
            activateOnTyping: true,
          }),
        ]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: true,
          closeBrackets: true,
        }}
        onChange={onChange}
        placeholder='Enter the text or HTML for this version'
        style={{
          fontSize: '14px',
        }}
      />
    </Box>
  );
};
