import { useState } from 'react';
import { EmailUpload } from './components/EmailUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { classifyEmail } from './lib/supabase';
import { EmailClassification } from './types';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<EmailClassification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (content: string, filename?: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const classification = await classifyEmail(content, filename);
      setResult(classification);
    } catch (err) {
      console.error('Error classifying email:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao processar email. Tente novamente.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Sistema de Classificação de Emails
          </h1>
          <p className="text-xl text-gray-600">
            Precisa verificar alguns e-mails, mas está com preguiça? <b>Carregue eles aqui</b>, e cuidaremos disso pra você!
          </p>
        </header>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {result ? (
          <ResultsDisplay result={result} onReset={handleReset} />
        ) : (
          <EmailUpload onSubmit={handleSubmit} isProcessing={isProcessing} />
        )}

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Sistema desenvolvido por @Kazbonfim, 2025
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
