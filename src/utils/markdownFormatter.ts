/**
 * Utility functions for formatting markdown text in the frontend
 */

export const formatMarkdown = (text: string): string => {
  if (!text) return '';
  
  return text
    // Convert **text** to <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *text* to <em>text</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert # Heading to <h3>Heading</h3>
    .replace(/^# (.*$)/gm, '<h3 class="text-lg font-semibold text-gray-900 mb-2">$1</h3>')
    // Convert ## Heading to <h4>Heading</h4>
    .replace(/^## (.*$)/gm, '<h4 class="text-md font-semibold text-gray-800 mb-1">$1</h4>')
    // Convert ### Heading to <h5>Heading</h5>
    .replace(/^### (.*$)/gm, '<h5 class="text-sm font-semibold text-gray-700 mb-1">$1</h5>')
    // Convert - item to <li>item</li>
    .replace(/^- (.*$)/gm, '<li class="flex items-start space-x-2"><span class="text-blue-600 mt-1">•</span><span>$1</span></li>')
    // Convert numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="flex items-start space-x-2"><span class="text-blue-600 mt-1">$&</span></li>')
    // Convert line breaks
    .replace(/\n/g, '<br>');
};

export const formatMarkdownForDisplay = (text: string): string => {
  return formatMarkdown(text);
};

export const formatAIResponse = (response: string): string => {
  if (!response) return '';
  
  // Split by double line breaks to create paragraphs
  const paragraphs = response.split('\n\n');
  
  let html = '<div class="space-y-3">';
  
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
      // This is a heading
      html += `<h3 class="text-lg font-semibold text-gray-900 mb-2">${paragraph.replace(/\*\*/g, '')}</h3>`;
    } else if (paragraph.trim().startsWith('- ')) {
      // This is a list
      const items = paragraph.split('\n').filter(item => item.trim().startsWith('- '));
      html += '<ul class="space-y-1">';
      items.forEach((item, itemIndex) => {
        html += `
          <li class="flex items-start space-x-2">
            <span class="text-blue-600 mt-1">•</span>
            <span class="text-gray-700 text-sm">${formatMarkdown(item.replace(/^- /, ''))}</span>
          </li>
        `;
      });
      html += '</ul>';
    } else {
      // Regular paragraph
      html += `<p class="text-gray-700 text-sm">${formatMarkdown(paragraph)}</p>`;
    }
  });
  
  html += '</div>';
  return html;
};
