import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

interface TaskNotificationRequest {
  taskId: string
  notificationType: 'warning' | 'execution' | 'overdue'
  recipientEmail: string
  taskData: {
    title: string
    description?: string
    clientId: string
    executionDateTime?: string
    warningDateTime?: string
    priority: string
  }
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { taskId, notificationType, recipientEmail, taskData }: TaskNotificationRequest = await req.json()

    console.log('Processing task notification:', { taskId, notificationType, recipientEmail })

    // Generate email content based on notification type
    let subject = ''
    let htmlContent = ''

    const formatDateTime = (dateTime: string) => {
      return new Date(dateTime).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    switch (notificationType) {
      case 'warning':
        subject = `🔔 Recordatorio: Tarea programada - ${taskData.title}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">🔔 Recordatorio de Tarea</h2>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">Tarea Programada</h3>
              <p><strong>Título:</strong> ${taskData.title}</p>
              ${taskData.description ? `<p><strong>Descripción:</strong> ${taskData.description}</p>` : ''}
              <p><strong>Cliente:</strong> ${taskData.clientId}</p>
              <p><strong>Prioridad:</strong> ${taskData.priority}</p>
              ${taskData.executionDateTime ? `<p><strong>Fecha de Ejecución:</strong> ${formatDateTime(taskData.executionDateTime)}</p>` : ''}
            </div>
            <p>Esta es una notificación de preaviso. La tarea está programada para ejecutarse próximamente.</p>
            <p style="color: #6b7280; font-size: 12px;">Este es un mensaje automático del sistema de gestión de tareas.</p>
          </div>
        `
        break

      case 'execution':
        subject = `⏰ Ejecutar Ahora: ${taskData.title}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">⏰ Hora de Ejecutar la Tarea</h2>
            <div style="background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #065f46;">Es momento de realizar esta tarea</h3>
              <p><strong>Título:</strong> ${taskData.title}</p>
              ${taskData.description ? `<p><strong>Descripción:</strong> ${taskData.description}</p>` : ''}
              <p><strong>Cliente:</strong> ${taskData.clientId}</p>
              <p><strong>Prioridad:</strong> ${taskData.priority}</p>
              <p><strong>Programada para:</strong> ${taskData.executionDateTime ? formatDateTime(taskData.executionDateTime) : 'Ahora'}</p>
            </div>
            <p>Por favor, marca la tarea como "En Proceso" cuando comiences y "Completada" al finalizar.</p>
            <p style="color: #6b7280; font-size: 12px;">Este es un mensaje automático del sistema de gestión de tareas.</p>
          </div>
        `
        break

      case 'overdue':
        subject = `🚨 URGENTE: Tarea Vencida - ${taskData.title}`
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">🚨 Tarea Vencida</h2>
            <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626;">
              <h3 style="margin: 0 0 10px 0; color: #991b1b;">ATENCIÓN: Esta tarea ha vencido</h3>
              <p><strong>Título:</strong> ${taskData.title}</p>
              ${taskData.description ? `<p><strong>Descripción:</strong> ${taskData.description}</p>` : ''}
              <p><strong>Cliente:</strong> ${taskData.clientId}</p>
              <p><strong>Prioridad:</strong> ${taskData.priority}</p>
              <p><strong>Debía ejecutarse:</strong> ${taskData.executionDateTime ? formatDateTime(taskData.executionDateTime) : 'Fecha no especificada'}</p>
            </div>
            <p style="color: #dc2626; font-weight: bold;">Esta tarea requiere atención inmediata. Por favor, contacta al cliente y reprograma si es necesario.</p>
            <p style="color: #6b7280; font-size: 12px;">Este es un mensaje automático del sistema de gestión de tareas.</p>
          </div>
        `
        break
    }

    // Send email via Resend REST API (no npm deps)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sistema de Tareas <tareas@empresa.com>',
        to: [recipientEmail],
        subject,
        html: htmlContent,
      }),
    })

    const emailJson: any = await emailResponse.json()
    console.log('Email response:', emailJson)

    const emailOk = emailResponse.ok
    const emailId = emailJson?.id || emailJson?.data?.id || null

    // Log notification in database
    const { error: notificationError } = await supabase
      .from('task_notifications')
      .insert({
        task_id: taskId,
        notification_type: notificationType,
        recipient_email: recipientEmail,
        status: emailOk ? 'sent' : 'failed',
        error_message: emailOk ? null : (emailJson?.error || emailJson?.message || JSON.stringify(emailJson))
      })

    if (notificationError) {
      console.error('Error logging notification:', notificationError)
    }

    if (!emailOk) {
      throw new Error(`Email sending failed`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId,
        message: 'Notification sent successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (err) {
    console.error('Error in send-task-notifications function:', err)
    const message = err instanceof Error ? err.message : String(err)
    
    return new Response(
      JSON.stringify({ 
        error: message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})