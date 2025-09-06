import React, { useState } from 'react';
import { Upload, MessageSquare, Users, TrendingUp, Calendar, BarChart3, Download, FileText } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { ChatData } from './types';

function App() {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MessageSquare className="w-12 h-12 text-green-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">WhatsApp Analytics</h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Upload your WhatsApp chat export and discover fascinating insights about your conversations
          </p>
        </header>

        {!chatData ? (
          <FileUpload 
            onDataParsed={setChatData} 
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <Dashboard 
            chatData={chatData} 
            onReset={() => setChatData(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;