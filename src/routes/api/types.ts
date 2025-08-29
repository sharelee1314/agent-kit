import {json} from '@sveltejs/kit'

export type ApiResponse<T = any> = {
  data?: T;
  msg?: string;
  code?: number;
}
