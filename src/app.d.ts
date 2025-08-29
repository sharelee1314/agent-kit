// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {JwtPayload} from '@lib/server/auth'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: JwtPayload | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
