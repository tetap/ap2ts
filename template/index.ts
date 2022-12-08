export const header = `/*
 * @description: {{description}}
 * @author: {{author}}
 * @date-time: {{date}}
 */\n`;
export const template = `import React from 'react'

export default function {{name}}() {
  return <div>{{name}}</div>
}
`;

export const controller = `import { BaseController } from '@/services/BaseController'
import type { BasePagination, BasePaginationResponse } from '@/services/models/BasePagination'

class {{name}}Controller extends BaseController {}

export default new {{name}}Controller()
`;

export const annotation = `/**
 * {{annotation}}
 */\n`