'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

// Función para renderizar markdown simple
function renderMarkdown(text: string) {
  // Convertir **texto** a <strong>
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Convertir *texto* a <em>
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Convertir ### Título a h3
  text = text.replace(/^### (.*?)$/gm, '<h3 class="text-base font-semibold mt-3 mb-2">$1</h3>')
  
  // Convertir ## Título a h2
  text = text.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>')
  
  // Convertir # Título a h1
  text = text.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold mt-4 mb-3">$1</h1>')
  
  // Convertir listas con viñetas (- item o • item)
  text = text.replace(/^[•-] (.*?)$/gm, '<li class="ml-4">• $1</li>')
  
  // Envolver listas en <ul>
  text = text.replace(/(<li.*?<\/li>\n?)+/g, '<ul class="space-y-1 my-2">$&</ul>')
  
  // Convertir saltos de línea a <br>
  text = text.replace(/\n/g, '<br/>')
  
  return text
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user'
  const processedContent = isUser ? content : renderMarkdown(content)

  return (
    <div className={cn(
      'flex gap-3 py-4',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <Avatar className={cn(
        'h-8 w-8 shrink-0',
        isUser ? 'bg-primary' : 'bg-blue-500'
      )}>
        <AvatarFallback className="text-white">
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn(
        'flex flex-col gap-1 max-w-[80%]',
        isUser ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          'rounded-2xl px-4 py-2.5',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        )}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          ) : (
            <div 
              className="text-sm prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          )}
        </div>
        
        {timestamp && (
          <span className="text-xs text-muted-foreground px-2">
            {timestamp.toLocaleTimeString('es-PE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
    </div>
  )
}
