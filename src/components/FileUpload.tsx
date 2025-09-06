import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parseWhatsAppChat } from '../utils/chatParser';
import { ChatData } from '../types';

interface FileUploadProps {
  onDataParsed: (data: ChatData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataParsed, isLoading, setIsLoading }) => {
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const chatData = parseWhatsAppChat(text);
      
      if (chatData.messages.length === 0) {
        throw new Error('No messages found in the file. Please ensure it\'s a valid WhatsApp chat export.');
      }
      
      onDataParsed(chatData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to parse chat file');
    } finally {
      setIsLoading(false);
    }
  }, [onDataParsed, setIsLoading]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-400 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-12 h-12 text-green-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Upload WhatsApp Chat</h2>
          <p className="text-gray-400 mb-8">
            Export your WhatsApp chat as a .txt file and upload it here for analysis
          </p>

          <label className="relative inline-block">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className={`
              bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600
              text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}
            `}>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5" />
                <span>{isLoading ? 'Processing...' : 'Choose Chat File'}</span>
              </div>
            </div>
          </label>
        </div>

        <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-medium mb-2">How to export WhatsApp chat:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-300">
                <li>Open WhatsApp and go to the chat you want to analyze</li>
                <li>Tap the three dots (⋮) in the top right corner</li>
                <li>Select "More" → "Export chat"</li>
                <li>Choose "Without Media" and save as .txt file</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
