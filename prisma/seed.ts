import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar usuário de desenvolvimento
  const devEmail = 'dev@teste.com'
  const devPassword = 'dev123'
  const hashedPassword = await bcrypt.hash(devPassword, 10)

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: devEmail },
  })

  if (existingUser) {
    console.log('✅ Usuário de desenvolvimento já existe')
    console.log(`   Email: ${devEmail}`)
    console.log(`   Senha: ${devPassword}`)
    return
  }

  // Criar usuário de desenvolvimento
  const devUser = await prisma.user.create({
    data: {
      name: 'Desenvolvedor Teste',
      email: devEmail,
      password: hashedPassword,
      phone: '(11) 99999-9999',
      city: 'São Paulo',
      state: 'SP',
      emailVerified: true,
    },
  })

  console.log('✅ Usuário de desenvolvimento criado com sucesso!')
  console.log('')
  console.log('📧 Credenciais de acesso:')
  console.log(`   Email: ${devEmail}`)
  console.log(`   Senha: ${devPassword}`)
  console.log('')
  console.log('⚠️  ATENÇÃO: Altere a senha após o primeiro login!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
