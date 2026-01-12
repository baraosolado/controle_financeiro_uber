// Declaração de tipos para swagger-ui-react
declare module 'swagger-ui-react' {
  import { Component } from 'react'

  export interface SwaggerUIProps {
    spec?: any
    url?: string
    onComplete?: (system: any) => void
    requestInterceptor?: (request: any) => any
    responseInterceptor?: (response: any) => any
    docExpansion?: 'list' | 'full' | 'none'
    defaultModelsExpandDepth?: number
    defaultModelExpandDepth?: number
    deepLinking?: boolean
    showExtensions?: boolean
    showCommonExtensions?: boolean
    filter?: boolean | string
    tryItOutEnabled?: boolean
    requestSnippetsEnabled?: boolean
    requestSnippets?: {
      generators?: {
        [key: string]: {
          title: string
          syntax?: string
        }
      }
      defaultExpanded?: boolean
      languages?: string[]
    }
    displayOperationId?: boolean
    displayRequestDuration?: boolean
    defaultModelRendering?: 'example' | 'model'
    presets?: any[]
    plugins?: any[]
    layout?: string
    [key: string]: any
  }

  export default class SwaggerUI extends Component<SwaggerUIProps> {}
}
