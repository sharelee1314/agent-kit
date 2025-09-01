import type { RequestHandler } from './$types';
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Agent Kit API',
			version: '1.0.0',
		},
		servers: [{ url: '/api' }],
	},
	apis: ['./src/routes/api/**/*.ts'],
};

export const GET: RequestHandler = async () => {
	const specs = swaggerJSDoc(options);
	return new Response(JSON.stringify(specs), {
		headers: { 'Content-Type': 'application/json' }
	});
};
