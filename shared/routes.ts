import { z } from 'zod';
import { questionSchema, parseUrlSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  parseError: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  parse: {
    excel: {
      method: 'POST' as const,
      path: '/api/parse/excel',
      // Input is multipart/form-data, handled separately in route
      responses: {
        200: z.array(questionSchema),
        400: errorSchemas.validation,
        500: errorSchemas.parseError,
      },
    },
    github: {
      method: 'POST' as const,
      path: '/api/parse/github',
      input: parseUrlSchema,
      responses: {
        200: z.array(questionSchema),
        400: errorSchemas.validation,
        500: errorSchemas.parseError,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ParseGithubInput = z.infer<typeof api.parse.github.input>;
export type ParsedResponse = z.infer<typeof api.parse.github.responses[200]>;
