// Importa ícones usados na interface
import { CheckCircle, XCircle, Copy, Check } from 'lucide-react';
// Hook para controlar estados internos
import { useState } from 'react';
// Tipo que descreve o formato da classificação recebida
import { EmailClassification } from '../types';

// Tipagens das Props
interface ResultsDisplayProps {
  // Resultado da análise do e-mail
  result: EmailClassification;
  // Função para reiniciar a classificação
  onReset: () => void;
}

export function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);
  // Controla se o texto foi copiado para exibir feedback visual

  const isProductive = result.category === 'Produtivo';
  // Verifica se o e-mail foi classificado como produtivo

  const handleCopy = async () => {
    // Função executada ao clicar em "Copiar"
    try {
      await navigator.clipboard.writeText(result.suggested_response);
      // Copia o texto da resposta sugerida

      setCopied(true);
      // Marca que foi copiado (para trocar o ícone e texto)

      setTimeout(() => setCopied(false), 2000);
      // Depois de 2s, volta ao estado original
    } catch (err) {
      console.error('Failed to copy:', err);
      // Caso o navegador não permita copiar
    }
  };

  return (
    // Container principal centralizado
    <div className="w-full max-w-3xl mx-auto">

      {/* Card, Ínicio */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">

        {/* Icons */}
        <div className="flex items-center justify-center mb-6">
          {isProductive ? (
            <CheckCircle className="w-16 h-16 text-green-500" />
          ) : (
            <XCircle className="w-16 h-16 text-orange-500" />
          )}
        </div>

        {/* Badges */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Classificação do Email
          </h3>

          {/* Badges */}
          <div
            className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${isProductive
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
              }`}
          >
            {result.category}
          </div>
        </div>

        {/* Bloco com infos da IA */}
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            Análise
          </h4>
          <p className="text-gray-700 leading-relaxed">{result.reasoning}</p>
        </div>

        {/* Resp. + CC */}
        <div className="border-t-2 border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-gray-800">
              Resposta Sugerida
            </h4>

            {/* CC */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
            >
              {copied ? (
                <>
                  {/* Já foi copiado */}
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Copiado!</span>
                </>
              ) : (
                <>
                  {/* Não foi copiado */}
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Resposta da IA */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {result.suggested_response}
            </p>
          </div>
        </div>
      </div>

      {/* Nova análise */}
      <button
        onClick={onReset}
        className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
      >
        Analisar outro e-mail
      </button>
    </div>
  );
}