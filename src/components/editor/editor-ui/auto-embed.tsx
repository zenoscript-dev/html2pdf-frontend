import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getSelection, $isRangeSelection, $createTextNode } from "lexical"
import { $createLinkNode } from "@lexical/link"

interface EmbedData {
  type: 'youtube' | 'twitter' | 'github' | 'image' | 'link'
  url: string
  title?: string
  description?: string
  thumbnail?: string
}

export function AutoEmbedPlugin() {
  const [editor] = useLexicalComposerContext()

  const detectEmbedType = (url: string): EmbedData | null => {
    // YouTube
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.includes('youtu.be/') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0]
      
      return {
        type: 'youtube',
        url,
        title: 'YouTube Video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }
    }
    
    // Twitter
    if (url.includes('twitter.com/') || url.includes('x.com/')) {
      return {
        type: 'twitter',
        url,
        title: 'Twitter Post'
      }
    }
    
    // GitHub
    if (url.includes('github.com/')) {
      return {
        type: 'github',
        url,
        title: 'GitHub Repository'
      }
    }
    
    // Image
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return {
        type: 'image',
        url,
        title: 'Image'
      }
    }
    
    // Regular link
    return {
      type: 'link',
      url,
      title: 'Link'
    }
  }

  const createEmbedElement = (embedData: EmbedData) => {
    switch (embedData.type) {
      case 'youtube':
        const videoId = embedData.url.includes('youtu.be/') 
          ? embedData.url.split('youtu.be/')[1]?.split('?')[0]
          : embedData.url.split('v=')[1]?.split('&')[0]
        
        return `
          <div class="youtube-embed" style="margin: 16px 0;">
            <iframe 
              width="560" 
              height="315" 
              src="https://www.youtube.com/embed/${videoId}" 
              frameborder="0" 
              allowfullscreen
              style="max-width: 100%; height: auto; aspect-ratio: 16/9;">
            </iframe>
          </div>
        `
      
      case 'twitter':
        return `
          <div class="twitter-embed" style="margin: 16px 0;">
            <blockquote class="twitter-tweet">
              <a href="${embedData.url}">View Tweet</a>
            </blockquote>
          </div>
        `
      
      case 'github':
        return `
          <div class="github-embed" style="margin: 16px 0; padding: 16px; border: 1px solid #e1e4e8; border-radius: 6px; background: #f6f8fa;">
            <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
              <a href="${embedData.url}" style="color: #0366d6; text-decoration: none;">${embedData.title}</a>
            </h4>
            <p style="margin: 0; color: #586069; font-size: 14px;">${embedData.url}</p>
          </div>
        `
      
      case 'image':
        return `
          <div class="image-embed" style="margin: 16px 0;">
            <img 
              src="${embedData.url}" 
              alt="${embedData.title || 'Image'}" 
              style="max-width: 100%; height: auto; border-radius: 6px;"
              onerror="this.style.display='none'"
            />
          </div>
        `
      
      default:
        return `
          <div class="link-embed" style="margin: 16px 0; padding: 12px; border: 1px solid #e1e4e8; border-radius: 6px; background: #f6f8fa;">
            <a href="${embedData.url}" style="color: #0366d6; text-decoration: none; font-weight: 500;">
              ${embedData.title || embedData.url}
            </a>
          </div>
        `
    }
  }

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData('text/plain')
      if (text && text.startsWith('http')) {
        const embedData = detectEmbedType(text)
        if (embedData) {
          event.preventDefault()
          
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              const embedHTML = createEmbedElement(embedData)
              selection.insertRawText(embedHTML)
            }
          })
        }
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        editor.update(() => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const text = selection.getTextContent()
            if (text.startsWith('http')) {
              const embedData = detectEmbedType(text)
              if (embedData) {
                selection.removeText()
                const embedHTML = createEmbedElement(embedData)
                selection.insertRawText(embedHTML)
              }
            }
          }
        })
      }
    }

    document.addEventListener('paste', handlePaste)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor])

  return null
}
