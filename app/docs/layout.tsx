import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentação da API - Desenvolvedores',
  description: 'Documentação Swagger/OpenAPI da API REST - Acesso restrito',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
