import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Se requiere texto para formatear" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY no está configurada");
    }

    const systemPrompt = `Eres un asistente especializado en formatear reportes técnicos profesionales.

REGLAS DE FORMATO ESTRICTAS:

1. Los títulos principales deben ir en negrita usando <strong></strong> (ej. Totales Escenario Completo, Detalles por Equipos, Notas, Evidencias Fotográficas).

2. Cuando se describen equipos, estados o partes, organízalos en viñetas principales con el nombre (ejemplo: Equipo 1, Equipo 2) usando <ul> y <li>.

3. Si dentro de un equipo hay detalles, conviértelos en sub-viñetas con guiones "–" usando listas anidadas.

4. Mantén TODO el contenido original, solo organiza y limpia (sin inventar ni quitar información).

5. Une frases cortadas, corrige espacios y usa puntuación adecuada.

6. Si hay una lista de totales o partes a comprar, colócala en bloque inicial como resumen.

7. Si hay fotos o referencias visuales, crea sección final "Evidencias Fotográficas", cada una con:
   - Foto N – título en negrita
   - Descripción debajo

ESTRUCTURA ESPERADA:
- Título centrado con negrita al inicio
- Encabezado con fecha y número de ticket (si aparece)
- Bloque de Totales / Resumen arriba
- Secciones por equipos con viñetas
- Notas al final
- Evidencias Fotográficas (si existen)

IMPORTANTE: Usa HTML básico para formato: <strong>, <ul>, <li>, <p>, <br>. NO uses markdown.`;

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
          { 
            role: "user", 
            content: `Formatea el siguiente texto como un reporte técnico profesional siguiendo las reglas establecidas:\n\n${text}` 
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Por favor, intenta más tarde." }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Se requiere pago. Agrega créditos a tu espacio de trabajo de Lovable AI." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      const errorText = await response.text();
      console.error("Error del gateway AI:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error al procesar la solicitud de IA" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await response.json();
    const formattedText = data.choices?.[0]?.message?.content || text;

    return new Response(
      JSON.stringify({ formattedText }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error en format-technical-report:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
