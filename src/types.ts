export interface EmailClassification {
  id: string;
  category: 'Produtivo' | 'Improdutivo';
  suggested_response: string;
  reasoning: string;
}

export interface Email {
  id: string;
  content: string;
  filename?: string;
  category?: string;
  suggested_response?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  created_at: string;
  processed_at?: string;
}
