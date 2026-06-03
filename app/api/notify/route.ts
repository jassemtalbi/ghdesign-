export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory set of connected admin clients
const clients = new Set<ReadableStreamDefaultController>();

export function notifyAdmins(data: object) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(ctrl => {
    try { ctrl.enqueue(new TextEncoder().encode(msg)); } catch { clients.delete(ctrl); }
  });
}

// GET — SSE stream for admin dashboard
export async function GET() {
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      clients.add(ctrl);
      // Keep-alive ping every 20s
      const ping = setInterval(() => {
        try { ctrl.enqueue(new TextEncoder().encode(': ping\n\n')); }
        catch { clearInterval(ping); clients.delete(ctrl); }
      }, 20000);
    },
    cancel() {
      clients.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
