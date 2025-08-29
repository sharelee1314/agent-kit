import {json} from '@sveltejs/kit'

export type ApiResponse<T = any> = {
  data?: T;
  msg?: string;
  code?: number;
}

export const ResponseJson = (data: any, code: number = 200, msg: string = '') => {
  return json({data, code, msg}, {status: 200})
}