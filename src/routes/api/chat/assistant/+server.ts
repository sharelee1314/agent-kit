import type { RequestHandler } from '../$types';
import { streamAgentResponse } from '$lib/server/agent';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { message } = await request.json();
		
		if (!message || typeof message !== 'string') {
			return new Response('Message is required', { status: 400 });
		}

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				
				try {
					for await (const chunk of streamAgentResponse(message)) {
						const data = `data: ${JSON.stringify(chunk)}\n\n`;
						controller.enqueue(encoder.encode(data));
					}
					
					controller.enqueue(encoder.encode('data: [DONE]\n\n'));
					controller.close();
				} catch (error) {
					console.error('Streaming error:', error);
					controller.close();
				}
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			}
		});

	} catch (error) {
		console.error('Chat API error:', error);
		return new Response('Internal server error', { status: 500 });
	}
};
