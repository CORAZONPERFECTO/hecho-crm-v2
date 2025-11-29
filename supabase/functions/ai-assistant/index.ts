import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Inicializar cliente Supabase para operaciones de DB
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Definir herramientas disponibles
    const tools = [
      {
        type: "function",
        function: {
          name: "crear_ticket",
          description: "Crea un nuevo ticket de servicio técnico",
          parameters: {
            type: "object",
            properties: {
              titulo: { type: "string", description: "Título del ticket" },
              descripcion: { type: "string", description: "Descripción detallada del problema" },
              prioridad: { type: "string", enum: ["baja", "media", "alta", "urgente"], description: "Prioridad del ticket" },
              cliente: { type: "string", description: "Nombre del cliente" },
              ubicacion: { type: "string", description: "Ubicación del servicio" },
              categoria: { type: "string", description: "Categoría del servicio" }
            },
            required: ["titulo", "cliente", "prioridad"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "crear_cotizacion",
          description: "Crea una nueva cotización para un ticket",
          parameters: {
            type: "object",
            properties: {
              ticket_id: { type: "string", description: "ID del ticket asociado" },
              items: {
                type: "array",
                description: "Lista de items a cotizar",
                items: {
                  type: "object",
                  properties: {
                    descripcion: { type: "string" },
                    cantidad: { type: "number" },
                    precio_unitario: { type: "number" }
                  }
                }
              },
              notas: { type: "string", description: "Notas adicionales" }
            },
            required: ["ticket_id", "items"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "crear_factura",
          description: "Crea una factura desde una cotización aprobada",
          parameters: {
            type: "object",
            properties: {
              cotizacion_id: { type: "string", description: "ID de la cotización a facturar" },
              fecha_vencimiento: { type: "string", description: "Fecha de vencimiento (YYYY-MM-DD)" }
            },
            required: ["cotizacion_id"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "consultar_tickets",
          description: "Consulta tickets existentes según filtros",
          parameters: {
            type: "object",
            properties: {
              estado: { type: "string", enum: ["abierto", "en-progreso", "cerrado-pendiente-cotizar", "aprobado-factura", "facturado-finalizado"], description: "Estado del ticket" },
              cliente: { type: "string", description: "Nombre del cliente" },
              prioridad: { type: "string", enum: ["baja", "media", "alta", "urgente"] }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "consultar_clientes",
          description: "Consulta información de clientes",
          parameters: {
            type: "object",
            properties: {
              nombre: { type: "string", description: "Nombre del cliente a buscar" }
            }
          }
        }
      }
    ];

    const systemPrompt = `Eres un asistente de IA para un sistema de gestión de servicios técnicos. 
Ayudas a los usuarios a crear tickets, cotizaciones y facturas usando lenguaje natural.

Cuando el usuario pida crear algo:
1. Extrae toda la información necesaria de su mensaje
2. Si falta información crítica, pregunta específicamente qué falta
3. Usa las funciones disponibles para ejecutar las acciones

Sé conciso pero amigable. Confirma las acciones ejecutadas.`;

    console.log("Llamando a Lovable AI con", messages.length, "mensajes");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        tool_choice: "auto",
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intenta nuevamente en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Se requiere pago. Agrega créditos a tu workspace de Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Error de Lovable AI:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Error en la gateway de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Procesar el stream y ejecutar tool calls
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let toolCalls: any[] = [];
    let currentToolCall: any = null;
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              
              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  if (tc.index !== undefined) {
                    if (!toolCalls[tc.index]) {
                      toolCalls[tc.index] = {
                        id: tc.id || `call_${tc.index}`,
                        type: 'function',
                        function: { name: '', arguments: '' }
                      };
                    }
                    if (tc.function?.name) {
                      toolCalls[tc.index].function.name += tc.function.name;
                    }
                    if (tc.function?.arguments) {
                      toolCalls[tc.index].function.arguments += tc.function.arguments;
                    }
                  }
                }
              }
            } catch (e) {
              // Ignorar errores de parsing
            }
          }
        }
      }
    }

    // Ejecutar tool calls si existen
    if (toolCalls.length > 0) {
      console.log("Ejecutando", toolCalls.length, "tool calls");
      const toolResults = [];
      
      for (const toolCall of toolCalls) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          let result;
          
          switch (toolCall.function.name) {
            case "crear_ticket":
              const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
              const { data: ticket, error: ticketError } = await supabase
                .from('tickets')
                .insert({
                  ticket_number: ticketNumber,
                  title: args.titulo,
                  description: args.descripcion || '',
                  priority: args.prioridad,
                  status: 'abierto',
                  client: args.cliente,
                  location: args.ubicacion || '',
                  category: args.categoria || 'General',
                  assigned_to: '',
                  internal_notes: '',
                  attachments: []
                })
                .select()
                .single();
              
              if (ticketError) throw ticketError;
              result = { success: true, ticket_number: ticketNumber, id: ticket.id };
              break;
              
            case "consultar_tickets":
              let query = supabase.from('tickets').select('*');
              if (args.estado) query = query.eq('status', args.estado);
              if (args.cliente) query = query.ilike('client', `%${args.cliente}%`);
              if (args.prioridad) query = query.eq('priority', args.prioridad);
              
              const { data: tickets, error: ticketsError } = await query.limit(10);
              if (ticketsError) throw ticketsError;
              result = { tickets };
              break;
              
            case "consultar_clientes":
              let clientQuery = supabase.from('contacts').select('name, email, phone1, status');
              if (args.nombre) clientQuery = clientQuery.ilike('name', `%${args.nombre}%`);
              
              const { data: clients, error: clientsError } = await clientQuery.limit(10);
              if (clientsError) throw clientsError;
              result = { clientes: clients };
              break;
              
            default:
              result = { error: "Función no implementada aún" };
          }
          
          toolResults.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify(result)
          });
        } catch (error) {
          console.error("Error ejecutando tool call:", error);
          toolResults.push({
            tool_call_id: toolCall.id,
            output: JSON.stringify({ error: error.message })
          });
        }
      }
      
      // Enviar resultados de vuelta a la IA
      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            {
              role: "assistant",
              tool_calls: toolCalls
            },
            ...toolResults.map(tr => ({
              role: "tool",
              tool_call_id: tr.tool_call_id,
              content: tr.output
            }))
          ],
          stream: true,
        }),
      });
      
      return new Response(followUpResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Si no hay tool calls, retornar el stream original
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Error en ai-assistant:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
