import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailRequest {
  content: string;
  filename?: string;
}

interface ClassificationResult {
  category: 'Produtivo' | 'Improdutivo';
  suggested_response: string;
  reasoning: string;
}

async function classifyEmail(content: string): Promise<ClassificationResult> {
  const cleanContent = content.trim().toLowerCase();
  
  const productiveKeywords = [
    'reunião', 'projeto', 'prazo', 'entrega', 'aprovação', 'tarefa',
    'objetivo', 'resultado', 'meta', 'cliente', 'contrato', 'proposta',
    'orçamento', 'relatório', 'documento', 'importante', 'urgente',
    'decisão', 'ação', 'responsabilidade', 'meeting', 'project', 'deadline',
    'delivery', 'approval', 'task', 'objective', 'result', 'goal',
    'client', 'contract', 'proposal', 'budget', 'report', 'document'
  ];
  
  const unproductiveKeywords = [
    'spam', 'promoção', 'desconto', 'oferta', 'grátis', 'ganhe',
    'prêmio', 'sorteio', 'clique aqui', 'compre já', 'newsletter',
    'propaganda', 'anúncio', 'marketing', 'promotion', 'discount',
    'offer', 'free', 'win', 'prize', 'lottery', 'click here',
    'buy now', 'advertisement'
  ];
  
  let productiveScore = 0;
  let unproductiveScore = 0;
  
  for (const keyword of productiveKeywords) {
    if (cleanContent.includes(keyword)) {
      productiveScore++;
    }
  }
  
  for (const keyword of unproductiveKeywords) {
    if (cleanContent.includes(keyword)) {
      unproductiveScore++;
    }
  }
  
  const hasBusinessStructure = /assunto:|subject:|prezado|caro|atenciosamente|cordialmente|dear|sincerely/.test(cleanContent);
  const hasActionItems = /favor|por favor|necessário|preciso|solicito|please|need|request/.test(cleanContent);
  const hasSpamIndicators = /!!!|clique|click|$$$|compre|buy/.test(cleanContent);
  
  if (hasBusinessStructure) productiveScore += 2;
  if (hasActionItems) productiveScore += 2;
  if (hasSpamIndicators) unproductiveScore += 3;
  
  const isProductive = productiveScore > unproductiveScore || (productiveScore >= 2 && unproductiveScore === 0);
  const category: 'Produtivo' | 'Improdutivo' = isProductive ? 'Produtivo' : 'Improdutivo';
  
  let suggested_response = '';
  let reasoning = '';
  
  if (category === 'Produtivo') {
    suggested_response = `Prezado(a),\n\nRecebemos seu email e agradecemos pelo contato. Estamos analisando as informações enviadas e retornaremos em breve com uma resposta detalhada.\n\nCaso necessite de uma resposta mais urgente, não hesite em nos contatar diretamente.\n\nAtenciosamente,\nEquipe de Atendimento`;
    reasoning = `Email classificado como Produtivo com base em: ${productiveScore} indicadores de conteúdo profissional encontrados (palavras-chave relacionadas a trabalho, estrutura formal, itens de ação).`;
  } else {
    suggested_response = `Este email foi identificado como não prioritário. Caso seja uma comunicação importante, por favor reenvie com mais detalhes sobre o assunto.`;
    reasoning = `Email classificado como Improdutivo com base em: ${unproductiveScore} indicadores de conteúdo promocional/spam encontrados, estrutura informal, ou ausência de elementos profissionais.`;
  }
  
  return {
    category,
    suggested_response,
    reasoning
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      const { content, filename }: EmailRequest = await req.json();

      if (!content || content.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Email content is required' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const { data: emailRecord, error: insertError } = await supabase
        .from('emails')
        .insert({
          content,
          filename,
          processing_status: 'processing'
        })
        .select()
        .single();

      if (insertError || !emailRecord) {
        throw new Error(`Failed to create email record: ${insertError?.message}`);
      }

      const classification = await classifyEmail(content);

      const { error: updateError } = await supabase
        .from('emails')
        .update({
          category: classification.category,
          suggested_response: classification.suggested_response,
          processing_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', emailRecord.id);

      if (updateError) {
        throw new Error(`Failed to update email record: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({
          id: emailRecord.id,
          category: classification.category,
          suggested_response: classification.suggested_response,
          reasoning: classification.reasoning
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');

      if (id) {
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          throw new Error(`Failed to fetch email: ${error.message}`);
        }

        return new Response(
          JSON.stringify(data),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(`Failed to fetch emails: ${error.message}`);
      }

      return new Response(
        JSON.stringify(data),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing email:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});