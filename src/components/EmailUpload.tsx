// Importa hook de estado e ícones usados no layout
import { useState } from 'react';
import { Upload, Mail, FileText, LoaderCircle} from 'lucide-react';

// Tipagem das props

interface EmailUploadProps {
  // Envia texto para análise
  onSubmit: (content: string, filename?: string) => void;
  isProcessing: boolean;
}

export function EmailUpload({ onSubmit, isProcessing }: EmailUploadProps) {
  // Guarda o texto digitado
  const [emailText, setEmailText] = useState('');
  // Alterna os estados do upload
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text');
  // Verificar se existe drag and drop
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (file: File) => {
    // Verificar se existe arquivos
    if (!file) return;

    // Tipos permitidos
    const allowedTypes = ['text/plain', 'application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      alert('Por favor, envie apenas arquivos .txt ou .pdf');
      return;
    }

    try {
      // Converter conteúdo para texto
      const text = await file.text();
      onSubmit(text, file.name);

    } catch (error) {
      console.error('Error reading file:', error);
      alert('Erro ao ler o arquivo');
    }
  };

  // Cuidar de drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    // Verificar se o usuário soltou um arquivo válido
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    // Enviar formulário
    e.preventDefault();
    if (emailText.trim()) {
      onSubmit(emailText.trim());
    }
  };

  return (
    // Container principal centralizado
    <div className="w-full max-w-3xl mx-auto">

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">

        {/* Título e ícone */}
        <div className="flex items-center justify-center mb-6">
          <Mail className="w-10 h-10 text-blue-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">
            Classificador de Emails
          </h2>
        </div>

        {/* Botões */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUploadMode('text')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${uploadMode === 'text'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            Inserir Texto
          </button>

          <button
            onClick={() => setUploadMode('file')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${uploadMode === 'file'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Upload de Arquivo
          </button>
        </div>

        {/* Modo texto */}
        {uploadMode === 'text' ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email-text"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Conteúdo do Email
              </label>

              {/* Área pra escrever ao invés de enviar arquivos */}
              <textarea
                id="email-text"
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Cole aqui o conteúdo do email que deseja analisar..."
                className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                disabled={isProcessing}
              />
            </div>

            {/* Botão de enviar texto */}
            <button
              type="submit"
              disabled={isProcessing || !emailText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                // Spinner de carregamento
                <span className="flex items-center justify-center">
                  <LoaderCircle className="w-5 h-5 mr-3 animate-spin" />
                  Processando...
                </span>
              ) : (
                'Analisar E-mail'
              )}
            </button>
          </form>

          // Envio de arquivos, PDF/TXT
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            {/* Ícone da área de upload */}
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />

            {/* Texto explicativo */}
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Arraste um arquivo aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Arquivos suportados: .txt, .pdf
            </p>

            {/* Input oculto para selecionar arquivo */}
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              disabled={isProcessing}
              className="hidden"
              id="file-upload"
            />

            {/* Botão estilizado que dispara o input */}
            <label
              htmlFor="file-upload"
              className={`inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg cursor-pointer transition-all shadow-md hover:shadow-lg ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              Selecionar Arquivo
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
