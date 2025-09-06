import { ChatData, Analytics } from '../types';

export function generateAnalytics(chatData: ChatData): Analytics {
  const { messages } = chatData;
  
  // Messages by user
  const messagesByUser: Record<string, number> = {};
  messages.forEach(msg => {
    messagesByUser[msg.sender] = (messagesByUser[msg.sender] || 0) + 1;
  });

  // Messages by day
  const messagesByDay: Record<string, number> = {};
  messages.forEach(msg => {
    const day = msg.timestamp.toISOString().split('T')[0];
    messagesByDay[day] = (messagesByDay[day] || 0) + 1;
  });

  // Messages by hour
  const messagesByHour: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    messagesByHour[i] = 0;
  }
  messages.forEach(msg => {
    const hour = msg.timestamp.getHours();
    messagesByHour[hour]++;
  });

  // Word frequency analysis
  const wordFrequency: Record<string, number> = {};
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'this', 'that', 'these', 'those', 'what', 'which', 'who', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very'
  ]);

  messages
    .filter(msg => msg.type === 'text')
    .forEach(msg => {
      const words = msg.content
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));
      
      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

  // Average message length
  const textMessages = messages.filter(msg => msg.type === 'text');
  const averageMessageLength = textMessages.reduce((sum, msg) => sum + msg.content.length, 0) / textMessages.length;

  // Most active day and hour
  const mostActiveDay = Object.entries(messagesByDay).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const mostActiveHour = Object.entries(messagesByHour).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  // Simple sentiment analysis
  const sentimentScores: Record<string, { positive: number; negative: number; neutral: number }> = {};
  
  const positiveWords = new Set([
    'good', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'excellent', 'perfect',
    'love', 'like', 'happy', 'glad', 'excited', 'thrilled', 'delighted', 'pleased',
    'beautiful', 'nice', 'sweet', 'cool', 'fun', 'funny', 'haha', 'lol', '😊', '😄',
    '😍', '❤️', '👍', '✨', 'thanks', 'thank', 'yes', 'yeah', 'yay', 'wow'
  ]);
  
  const negativeWords = new Set([
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'angry', 'mad', 'upset',
    'sad', 'disappointed', 'frustrated', 'annoyed', 'worried', 'scared', 'tired',
    'sick', 'hurt', 'pain', 'problem', 'issue', 'wrong', 'difficult', 'hard',
    'no', 'never', 'nothing', 'nobody', '😢', '😠', '😡', '💔', '👎'
  ]);

  chatData.participants.forEach(participant => {
    const userMessages = messages.filter(msg => msg.sender === participant && msg.type === 'text');
    let positive = 0, negative = 0, neutral = 0;

    userMessages.forEach(msg => {
      const words = msg.content.toLowerCase().split(/\s+/);
      let sentiment = 'neutral';
      let positiveCount = 0, negativeCount = 0;

      words.forEach(word => {
        if (positiveWords.has(word)) positiveCount++;
        if (negativeWords.has(word)) negativeCount++;
      });

      if (positiveCount > negativeCount) sentiment = 'positive';
      else if (negativeCount > positiveCount) sentiment = 'negative';

      if (sentiment === 'positive') positive++;
      else if (sentiment === 'negative') negative++;
      else neutral++;
    });

    sentimentScores[participant] = { positive, negative, neutral };
  });

  return {
    messagesByUser,
    messagesByDay,
    messagesByHour,
    wordFrequency,
    averageMessageLength,
    mostActiveDay,
    mostActiveHour: parseInt(mostActiveHour),
    sentimentScores
  };
}