import { ChatData, Message } from '../types';

export function parseWhatsAppChat(text: string): ChatData {
  const lines = text.split('\n').filter(line => line.trim());
  const messages: Message[] = [];
  const participants = new Set<string>();
  
  // Comprehensive WhatsApp export format patterns
  const patterns = [
    // Format: [DD/MM/YY, HH:MM:SS] Name: Message
    /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s*([^:]+?):\s*(.*)$/i,
    // Format: DD/MM/YYYY, HH:MM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s*[-–]\s*([^:]+?):\s*(.*)$/i,
    // Format: DD/MM/YY HH:MM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s*[-–]\s*([^:]+?):\s*(.*)$/i,
    // Format: MM/DD/YY, HH:MM AM/PM - Name: Message (US format)
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s?[AP]M)\s*[-–]\s*([^:]+?):\s*(.*)$/i,
    // Format: DD.MM.YY, HH:MM - Name: Message (European format)
    /^(\d{1,2}\.\d{1,2}\.\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s*[-–]\s*([^:]+?):\s*(.*)$/i,
    // Format: YYYY-MM-DD HH:MM:SS - Name: Message (ISO format)
    /^(\d{4}-\d{1,2}-\d{1,2})\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s*[-–]\s*([^:]+?):\s*(.*)$/i,
    // Format: DD-MM-YYYY HH:MM - Name: Message
    /^(\d{1,2}-\d{1,2}-\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s*[-–]\s*([^:]+?):\s*(.*)$/i,
    // Format without brackets: DD/MM/YY HH:MM Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s+([^:]+?):\s*(.*)$/i,
    // Format with different separators: DD/MM/YY at HH:MM - Name: Message
    /^(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(?:at\s+)?(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s*[-–]\s*([^:]+?):\s*(.*)$/i,
    // Flexible format: any date-like pattern followed by time and name
    /^(\d{1,4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,4})[,\s]*(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s*[-–]?\s*([^:]+?):\s*(.*)$/i,
  ];

  let currentMessage: Message | null = null;
  let messageCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let matched = false;
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        // Save previous message if exists
        if (currentMessage) {
          messages.push(currentMessage);
          messageCount++;
        }

        const [, dateStr, timeStr, sender, content] = match;
        
        // Parse date and time
        const date = parseDate(dateStr, timeStr);
        if (!date) continue;

        // Clean sender name - remove phone numbers, extra spaces, etc.
        const cleanSender = cleanSenderName(sender);
        if (!cleanSender) continue;
        
        participants.add(cleanSender);

        // Skip if content is empty or just whitespace
        if (!content || !content.trim()) continue;

        // Determine message type
        const type = isMediaMessage(content) ? 'media' : 'text';

        currentMessage = {
          id: `${date.getTime()}-${Math.random()}`,
          timestamp: date,
          sender: cleanSender,
          content: content.trim(),
          type
        };

        matched = true;
        break;
      }
    }

    // If no pattern matched, it might be a continuation of the previous message
    if (!matched && currentMessage && line.length > 0) {
      // Only add continuation if it doesn't look like a system message
      if (!isSystemMessage(line)) {
        currentMessage.content += '\n' + line;
      }
    }
  }

  // Add the last message
  if (currentMessage) {
    messages.push(currentMessage);
    messageCount++;
  }

  // If no messages found with strict parsing, try a more lenient approach
  if (messages.length === 0) {
    return tryLenientParsing(text);
  }

  // Filter out system messages and very short messages
  const filteredMessages = messages.filter(msg => 
    msg.content && 
    !isSystemMessage(msg.content) &&
    msg.content.trim().length > 0 &&
    msg.sender.length > 0
  );

  if (filteredMessages.length === 0) {
    throw new Error(`Found ${messageCount} potential messages but none were valid. Please ensure this is a WhatsApp chat export file. The file should contain messages in format like "DD/MM/YY, HH:MM - Name: Message"`);
  }

  // Calculate statistics
  const dates = filteredMessages.map(msg => msg.timestamp);
  const dateRange = {
    start: new Date(Math.min(...dates.map(d => d.getTime()))),
    end: new Date(Math.max(...dates.map(d => d.getTime())))
  };

  const mediaMessages = filteredMessages.filter(msg => msg.type === 'media').length;
  const textMessages = filteredMessages.length - mediaMessages;

  return {
    messages: filteredMessages,
    participants: Array.from(participants),
    dateRange,
    totalMessages: filteredMessages.length,
    mediaMessages,
    textMessages
  };
}

function tryLenientParsing(text: string): ChatData {
  const lines = text.split('\n').filter(line => line.trim());
  const messages: Message[] = [];
  const participants = new Set<string>();
  
  // Very lenient pattern - just look for anything that might be a message
  const lenientPattern = /^(.{8,}?)\s*[-–:]\s*(.+?):\s*(.+)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 10) continue; // Skip very short lines
    
    const match = line.match(lenientPattern);
    if (match) {
      const [, dateTimeStr, sender, content] = match;
      
      // Try to extract any date/time from the first part
      const dateMatch = dateTimeStr.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
      const timeMatch = dateTimeStr.match(/(\d{1,2}:\d{2})/);
      
      let date = new Date();
      if (dateMatch && timeMatch) {
        const parsedDate = parseDate(dateMatch[1], timeMatch[1]);
        if (parsedDate) date = parsedDate;
      }
      
      const cleanSender = cleanSenderName(sender);
      if (!cleanSender || !content.trim()) continue;
      
      participants.add(cleanSender);
      
      messages.push({
        id: `${date.getTime()}-${Math.random()}`,
        timestamp: date,
        sender: cleanSender,
        content: content.trim(),
        type: isMediaMessage(content) ? 'media' : 'text'
      });
    }
  }
  
  if (messages.length === 0) {
    throw new Error('Could not parse any messages from this file. Please ensure it\'s a valid WhatsApp chat export. The file should contain messages with timestamps, sender names, and message content.');
  }
  
  const dates = messages.map(msg => msg.timestamp);
  const dateRange = {
    start: new Date(Math.min(...dates.map(d => d.getTime()))),
    end: new Date(Math.max(...dates.map(d => d.getTime())))
  };

  return {
    messages,
    participants: Array.from(participants),
    dateRange,
    totalMessages: messages.length,
    mediaMessages: messages.filter(msg => msg.type === 'media').length,
    textMessages: messages.filter(msg => msg.type === 'text').length
  };
}

function cleanSenderName(sender: string): string {
  if (!sender) return '';
  
  return sender
    .trim()
    .replace(/^\+\d+\s*/, '') // Remove phone numbers
    .replace(/^~/, '') // Remove ~ prefix
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

function parseDate(dateStr: string, timeStr: string): Date | null {
  try {
    let day: number, month: number, year: number;
    
    // Handle different date separators and formats
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      
      // Try DD/MM/YY format first
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      year = parseInt(parts[2]);
      
      // If day > 12, might be MM/DD/YY format
      if (day > 12 && parseInt(parts[1]) <= 12) {
        month = parseInt(parts[0]) - 1;
        day = parseInt(parts[1]);
      }
    } else if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length !== 3) return null;
      day = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      year = parseInt(parts[2]);
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      
      // Check if it's YYYY-MM-DD or DD-MM-YYYY
      if (parts[0].length === 4) {
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[2]);
      } else {
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        year = parseInt(parts[2]);
      }
    } else {
      return null;
    }
    
    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    // Parse time
    let hour: number, minute: number, second = 0;
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s?([AP]M))?/i);
    
    if (!timeMatch) return null;
    
    hour = parseInt(timeMatch[1]);
    minute = parseInt(timeMatch[2]);
    if (timeMatch[3]) second = parseInt(timeMatch[3]);
    
    // Handle AM/PM
    if (timeMatch[4]) {
      const ampm = timeMatch[4].toUpperCase();
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
    }

    const date = new Date(year, month, day, hour, minute, second);
    
    // Validate the date
    if (isNaN(date.getTime())) return null;
    if (date.getFullYear() < 2000 || date.getFullYear() > 2030) return null;
    
    return date;
  } catch (error) {
    return null;
  }
}

function isMediaMessage(content: string): boolean {
  const mediaPatterns = [
    /\<Media omitted\>/i,
    /\<Image omitted\>/i,
    /\<Video omitted\>/i,
    /\<Audio omitted\>/i,
    /\<Document omitted\>/i,
    /\<GIF omitted\>/i,
    /\<Sticker omitted\>/i,
    /\<Contact card omitted\>/i,
    /\<Location omitted\>/i,
    /image\/video\/audio\/document\s+omitted/i,
    /file attached/i,
    /photo/i,
    /video/i,
    /audio/i
  ];

  return mediaPatterns.some(pattern => pattern.test(content));
}

function isSystemMessage(content: string): boolean {
  const systemPatterns = [
    /joined using this group's invite link/i,
    /left/i,
    /was removed/i,
    /added/i,
    /changed the group description/i,
    /changed this group's icon/i,
    /created group/i,
    /Messages and calls are end-to-end encrypted/i,
    /changed the group name/i,
    /You're now an admin/i,
    /security code changed/i,
    /missed voice call/i,
    /missed video call/i,
    /call ended/i,
    /calling\.\.\./i
  ];

  return systemPatterns.some(pattern => pattern.test(content));
}