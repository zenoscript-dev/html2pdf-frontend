/**
 * Utility functions for converting between HTML and Lexical JSON format
 * Used for rich text editor integration with API data
 */

import type { SerializedEditorState } from 'lexical';

/**
 * Converts HTML string to Lexical JSON format
 * Handles common HTML elements like p, h1-h6, strong, em, ul, ol, li
 * Preserves original numbering structure (continuous or separate lists)
 */
export function htmlToLexical(html: string): SerializedEditorState {
  if (!html || html.trim() === '') {
    return {
      root: {
        children: [
          {
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1
          } as any
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1
      } as any
    } as any;
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Detect if the HTML has continuous numbering across multiple ol elements
  const allOrderedLists = tempDiv.querySelectorAll('ol');
  const allUnorderedLists = tempDiv.querySelectorAll('ul');
  let globalListItemCounter = 1;
  let isContinuousNumbering = false;

  // Check if we should use continuous numbering
  if (allOrderedLists.length > 1) {
    // Look for any existing start attributes
    const hasStartAttributes = Array.from(allOrderedLists).some(ol => ol.hasAttribute('start'));
    
    // Only use continuous numbering if:
    // 1. There are multiple ol elements
    // 2. No start attributes are present
    // 3. There are no ul elements mixed in (all lists are ordered)
    const hasMixedLists = allUnorderedLists.length > 0;
    
    isContinuousNumbering = !hasStartAttributes && !hasMixedLists;
  }

  const convertNodeToLexical = (node: Node): any => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim() === '') return null;
      
      return {
        text: text,
        type: 'text',
        format: 0,
        style: '',
        detail: 0,
        mode: 'normal',
        version: 1
      };
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Handle text formatting
      if (['strong', 'b'].includes(tagName)) {
        const textNode = element.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          return {
            text: textNode.textContent || '',
            type: 'text',
            format: 1, // Bold
            style: '',
            detail: 0,
            mode: 'normal',
            version: 1
          };
        }
      }

      if (['em', 'i'].includes(tagName)) {
        const textNode = element.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          return {
            text: textNode.textContent || '',
            type: 'text',
            format: 2, // Italic
            style: '',
            detail: 0,
            mode: 'normal',
            version: 1
          };
        }
      }

      // Handle headings
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        const children = Array.from(element.childNodes)
          .map(convertNodeToLexical)
          .filter(Boolean);

        return {
          children,
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: tagName,
          type: 'heading',
          version: 1
        } as any;
      }

      // Handle lists
      if (tagName === 'ul') {
        const children = Array.from(element.childNodes)
          .filter(node => node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName.toLowerCase() === 'li')
          .map(liNode => {
            const liChildren = Array.from(liNode.childNodes)
              .map(convertNodeToLexical)
              .filter(Boolean);

            return {
              children: liChildren,
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'listitem',
              value: 1,
              version: 1
            };
          });

        return {
          children,
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'list',
          version: 1,
          listType: 'bullet'
        };
      }

      if (tagName === 'ol') {
        // Check if this ol has a start attribute
        const startAttribute = element.getAttribute('start');
        const startValue = startAttribute ? parseInt(startAttribute, 10) : 1;
        
        const children = Array.from(element.childNodes)
          .filter(node => node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName.toLowerCase() === 'li')
          .map((liNode, index) => {
            const liChildren = Array.from(liNode.childNodes)
              .map(convertNodeToLexical)
              .filter(Boolean);

            let itemValue: number;
            
            if (isContinuousNumbering) {
              // Use global counter for continuous numbering
              itemValue = globalListItemCounter;
              globalListItemCounter++;
            } else if (startAttribute) {
              // Use start attribute value + index
              itemValue = startValue + index;
            } else {
              // Each ol starts from 1 (separate numbering)
              itemValue = index + 1;
            }

            return {
              children: liChildren,
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'listitem',
              value: itemValue,
              version: 1
            };
          });

        return {
          children,
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'list',
          version: 1,
          listType: 'number'
        };
      }

      // Handle paragraphs
      if (tagName === 'p') {
        const children = Array.from(element.childNodes)
          .map(convertNodeToLexical)
          .filter(Boolean);

        return {
          children,
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1
        };
      }

      // Handle divs and other block elements
      if (['div', 'section', 'article'].includes(tagName)) {
        const children = Array.from(element.childNodes)
          .map(convertNodeToLexical)
          .filter(Boolean);

        // If div contains only text or inline elements, wrap in paragraph
        if (children.length > 0 && children.every(child => child.type === 'text')) {
          return {
            children,
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1
          };
        }

        return {
          children,
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1
        };
      }

      // Handle inline elements - extract their content
      if (['span', 'a', 'code'].includes(tagName)) {
        const children = Array.from(element.childNodes)
          .map(convertNodeToLexical)
          .filter(Boolean);

        // For inline elements, return their children directly
        return children.length === 1 ? children[0] : children;
      }
    }

    return null;
  };

  const children = Array.from(tempDiv.childNodes)
    .map(convertNodeToLexical)
    .filter(Boolean);

  // If no children, create an empty paragraph
  if (children.length === 0) {
    children.push({
      children: [],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'paragraph',
      version: 1
    });
  }

  return {
    root: {
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1
    }
  } as any;
}

/**
 * Converts Lexical JSON format to HTML string
 * Handles common Lexical nodes like paragraph, heading, list, text
 */
export function lexicalToHtml(lexicalState: SerializedEditorState): string {
  if (!lexicalState || !lexicalState.root || !lexicalState.root.children) {
    return '';
  }

  const convertNodeToHTML = (node: any): string => {
    if (!node) return '';

    switch (node.type) {
      case 'text':
        let text = node.text || '';
        let tag = 'span';
        
        // Apply formatting
        if (node.format) {
          if (node.format & 1) { // Bold
            tag = 'strong';
          } else if (node.format & 2) { // Italic
            tag = 'em';
          } else if (node.format & 32) { // Code
            tag = 'code';
          }
        }

        if (tag === 'span') {
          return text;
        }
        return `<${tag}>${text}</${tag}>`;

      case 'paragraph':
        const pChildren = node.children?.map(convertNodeToHTML).join('') || '';
        return `<p>${pChildren}</p>`;

      case 'heading':
        const level = node.tag?.replace('h', '') || '1';
        const hChildren = node.children?.map(convertNodeToHTML).join('') || '';
        return `<h${level}>${hChildren}</h${level}>`;

      case 'list':
        const listTag = node.listType === 'number' ? 'ol' : 'ul';
        const listChildren = node.children?.map(convertNodeToHTML).join('') || '';
        return `<${listTag}>${listChildren}</${listTag}>`;

      case 'listitem':
        const liChildren = node.children?.map(convertNodeToHTML).join('') || '';
        return `<li>${liChildren}</li>`;

      default:
        // For unknown node types, try to render children
        if (node.children) {
          return node.children.map(convertNodeToHTML).join('');
        }
        return '';
    }
  };

  return lexicalState.root.children
    .map(convertNodeToHTML)
    .join('');
}

/**
 * Extracts plain text from HTML string
 * Useful for creating previews or search indexes
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}
