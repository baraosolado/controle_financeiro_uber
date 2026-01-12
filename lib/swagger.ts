import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Controle Financeiro Uber - API REST',
      version: '1.0.0',
      description: 'API REST completa para sistema de controle financeiro para motoristas de aplicativo',
      contact: {
        name: 'Suporte',
        email: 'suporte@controlefinanceirouber.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.controlefinanceirouber.com',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do NextAuth.js',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Chave de API para acesso à API pública',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
            },
          },
        },
        Record: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            platforms: {
              type: 'array',
              items: { type: 'string' },
              description: 'Plataformas utilizadas (Uber, 99, etc)',
            },
            revenue: { type: 'number', format: 'decimal' },
            revenueBreakdown: {
              type: 'object',
              additionalProperties: { type: 'number' },
              description: 'Breakdown de receita por plataforma',
            },
            expenses: { type: 'number', format: 'decimal' },
            expenseFuel: { type: 'number', format: 'decimal', nullable: true },
            expenseMaintenance: { type: 'number', format: 'decimal', nullable: true },
            expenseFood: { type: 'number', format: 'decimal', nullable: true },
            expenseWash: { type: 'number', format: 'decimal', nullable: true },
            expenseToll: { type: 'number', format: 'decimal', nullable: true },
            expenseParking: { type: 'number', format: 'decimal', nullable: true },
            expenseOther: { type: 'number', format: 'decimal', nullable: true },
            profit: { type: 'number', format: 'decimal' },
            kilometers: { type: 'number', format: 'decimal' },
            kmPerLiter: { type: 'number', format: 'decimal', nullable: true },
            tripsCount: { type: 'integer', nullable: true },
            hoursWorked: { type: 'number', format: 'decimal', nullable: true },
            startTime: { type: 'string', pattern: '^\\d{2}:\\d{2}$', nullable: true },
            endTime: { type: 'string', pattern: '^\\d{2}:\\d{2}$', nullable: true },
            notes: { type: 'string', maxLength: 300, nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        FuelLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            liters: { type: 'number', format: 'decimal' },
            price: { type: 'number', format: 'decimal' },
            totalCost: { type: 'number', format: 'decimal' },
            odometer: { type: 'number', format: 'decimal', nullable: true },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Maintenance: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            type: { type: 'string' },
            description: { type: 'string' },
            cost: { type: 'number', format: 'decimal' },
            odometer: { type: 'number', format: 'decimal', nullable: true },
            nextDate: { type: 'string', format: 'date', nullable: true },
            nextOdometer: { type: 'number', format: 'decimal', nullable: true },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Goal: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['monthly', 'weekly', 'custom'] },
            targetValue: { type: 'number', format: 'decimal' },
            targetPeriod: { type: 'string', format: 'date' },
            achieved: { type: 'boolean' },
            achievedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['performance', 'opportunity', 'maintenance', 'benchmark'] },
            title: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        DashboardStats: {
          type: 'object',
          properties: {
            currentMonthStats: {
              type: 'object',
              properties: {
                revenue: { type: 'number' },
                expenses: { type: 'number' },
                profit: { type: 'number' },
                kilometers: { type: 'number' },
              },
            },
            totalStats: {
              type: 'object',
              properties: {
                totalRevenue: { type: 'number' },
                totalExpenses: { type: 'number' },
                totalProfit: { type: 'number' },
                totalKilometers: { type: 'number' },
                totalDaysWorked: { type: 'number' },
              },
            },
            monthlyStats: {
              type: 'object',
              properties: {
                daysWorked: { type: 'number' },
                avgProfitPerDay: { type: 'number' },
                profitPerKm: { type: 'number' },
                costPerKm: { type: 'number' },
                revenuePerKm: { type: 'number' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './app/api/**/route.ts', // Caminho para os arquivos de rota
    './lib/swagger-docs.ts', // Documentação adicional
  ],
}

export const swaggerSpec = swaggerJsdoc(options)
