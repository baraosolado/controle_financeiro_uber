/**
 * @swagger
 * tags:
 *   - name: Autenticação
 *     description: Endpoints de autenticação e registro
 *   - name: Registros
 *     description: Gerenciamento de registros financeiros diários
 *   - name: Combustível
 *     description: Gerenciamento de abastecimentos
 *   - name: Manutenção
 *     description: Gerenciamento de manutenções do veículo
 *   - name: Metas
 *     description: Gerenciamento de metas financeiras
 *   - name: Alertas
 *     description: Sistema de alertas inteligentes
 *   - name: Dashboard
 *     description: Estatísticas e métricas do dashboard
 *   - name: Exportação
 *     description: Exportação de dados
 *   - name: Importação
 *     description: Importação de dados
 *   - name: Relatórios
 *     description: Relatórios fiscais e análises
 *   - name: Plataformas
 *     description: Comparação e análise de plataformas
 *   - name: API Pública
 *     description: API pública com autenticação por chave
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Autenticação]
 *     summary: Registrar novo usuário
 *     description: Cria uma nova conta de usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "senha123"
 *               phone:
 *                 type: string
 *                 example: "+5511999999999"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Dados inválidos ou email já cadastrado
 *       429:
 *         description: Muitas tentativas (rate limit)
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Autenticação]
 *     summary: Solicitar recuperação de senha
 *     description: Envia email com link para recuperação de senha
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email enviado (mesmo se não existir)
 *       429:
 *         description: Muitas tentativas (rate limit)
 */

/**
 * @swagger
 * /api/records:
 *   get:
 *     tags: [Registros]
 *     summary: Listar registros
 *     description: Retorna lista de registros financeiros do usuário
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de registros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Record'
 *       401:
 *         description: Não autenticado
 *       429:
 *         description: Muitas requisições (rate limit)
 *   post:
 *     tags: [Registros]
 *     summary: Criar novo registro
 *     description: Cria um novo registro financeiro diário
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - revenue
 *               - kilometers
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *                 example: "2026-01-13"
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Uber", "99"]
 *               revenue:
 *                 type: number
 *                 minimum: 0
 *                 example: 350.50
 *               revenueBreakdown:
 *                 type: object
 *                 additionalProperties:
 *                   type: number
 *                 example: {"Uber": 200.50, "99": 150.00}
 *               expenses:
 *                 type: number
 *                 minimum: 0
 *               expenseFuel:
 *                 type: number
 *                 minimum: 0
 *               expenseMaintenance:
 *                 type: number
 *                 minimum: 0
 *               expenseFood:
 *                 type: number
 *                 minimum: 0
 *               expenseWash:
 *                 type: number
 *                 minimum: 0
 *               expenseToll:
 *                 type: number
 *                 minimum: 0
 *               expenseParking:
 *                 type: number
 *                 minimum: 0
 *               expenseOther:
 *                 type: number
 *                 minimum: 0
 *               kilometers:
 *                 type: number
 *                 minimum: 0
 *                 example: 150
 *               kmPerLiter:
 *                 type: number
 *                 minimum: 0
 *                 example: 12.5
 *               tripsCount:
 *                 type: integer
 *                 minimum: 0
 *                 example: 25
 *               hoursWorked:
 *                 type: number
 *                 minimum: 0
 *                 example: 8.5
 *               startTime:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}$'
 *                 example: "17:30"
 *               notes:
 *                 type: string
 *                 maxLength: 300
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Dados inválidos ou registro já existe para a data
 *       401:
 *         description: Não autenticado
 *       429:
 *         description: Muitas requisições (rate limit)
 */

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     tags: [Registros]
 *     summary: Obter registro por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       404:
 *         description: Registro não encontrado
 *   put:
 *     tags: [Registros]
 *     summary: Atualizar registro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               revenue:
 *                 type: number
 *               expenses:
 *                 type: number
 *               kilometers:
 *                 type: number
 *     responses:
 *       200:
 *         description: Registro atualizado
 *       404:
 *         description: Registro não encontrado
 *   delete:
 *     tags: [Registros]
 *     summary: Deletar registro
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registro deletado
 *       404:
 *         description: Registro não encontrado
 */

/**
 * @swagger
 * /api/fuel:
 *   get:
 *     tags: [Combustível]
 *     summary: Listar abastecimentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de abastecimentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FuelLog'
 *   post:
 *     tags: [Combustível]
 *     summary: Registrar abastecimento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - liters
 *               - price
 *               - totalCost
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               liters:
 *                 type: number
 *                 minimum: 0.01
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *               totalCost:
 *                 type: number
 *                 minimum: 0
 *               odometer:
 *                 type: number
 *               notes:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       201:
 *         description: Abastecimento registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FuelLog'
 */

/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     tags: [Manutenção]
 *     summary: Listar manutenções
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de manutenções
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Maintenance'
 *   post:
 *     tags: [Manutenção]
 *     summary: Registrar manutenção
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - type
 *               - description
 *               - cost
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               cost:
 *                 type: number
 *                 minimum: 0
 *               odometer:
 *                 type: number
 *               nextDate:
 *                 type: string
 *                 format: date
 *               nextOdometer:
 *                 type: number
 *               notes:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       201:
 *         description: Manutenção registrada
 */

/**
 * @swagger
 * /api/goals:
 *   get:
 *     tags: [Metas]
 *     summary: Listar metas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [monthly, weekly, custom]
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de metas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Goal'
 *   post:
 *     tags: [Metas]
 *     summary: Criar meta
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - targetValue
 *               - targetPeriod
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [monthly, weekly, custom]
 *               targetValue:
 *                 type: number
 *                 minimum: 0
 *               targetPeriod:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Meta criada
 */

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     tags: [Alertas]
 *     summary: Listar alertas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [performance, opportunity, maintenance, benchmark]
 *     responses:
 *       200:
 *         description: Lista de alertas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 *   post:
 *     tags: [Alertas]
 *     summary: Criar alerta
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [performance, opportunity, maintenance, benchmark]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [info, warning, success, error]
 *               actionUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Alerta criado
 */

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Obter estatísticas do dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, custom]
 *           default: month
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estatísticas do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 */

/**
 * @swagger
 * /api/export:
 *   get:
 *     tags: [Exportação]
 *     summary: Exportar dados em CSV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv]
 *           default: csv
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Arquivo CSV
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */

/**
 * @swagger
 * /api/export/advanced:
 *   get:
 *     tags: [Exportação]
 *     summary: Exportar dados em Excel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx]
 *           default: xlsx
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Arquivo Excel
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /api/import:
 *   post:
 *     tags: [Importação]
 *     summary: Importar dados de arquivo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - mapping
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               mapping:
 *                 type: string
 *                 description: JSON com mapeamento de colunas
 *     responses:
 *       200:
 *         description: Dados importados com sucesso
 *       400:
 *         description: Arquivo inválido ou muito grande (máx 10MB)
 *       429:
 *         description: Muitas requisições (rate limit)
 */

/**
 * @swagger
 * /api/reports/ir:
 *   get:
 *     tags: [Relatórios]
 *     summary: Gerar relatório fiscal para IR
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2026
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *           default: json
 *     responses:
 *       200:
 *         description: Relatório fiscal
 */

/**
 * @swagger
 * /api/records/platforms/comparison:
 *   get:
 *     tags: [Plataformas]
 *     summary: Comparar performance entre plataformas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *           default: month
 *     responses:
 *       200:
 *         description: Comparação de plataformas
 */

/**
 * @swagger
 * /api/v1/records:
 *   get:
 *     tags: [API Pública]
 *     summary: Listar registros (API Pública)
 *     description: Endpoint público para listar registros usando API key
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de registros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Record'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: API key inválida
 *       429:
 *         description: Muitas requisições (rate limit)
 *   post:
 *     tags: [API Pública]
 *     summary: Criar registro (API Pública)
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - revenue
 *               - expenses
 *               - kilometers
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               revenue:
 *                 type: number
 *               expenses:
 *                 type: number
 *               kilometers:
 *                 type: number
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro criado
 *       401:
 *         description: API key inválida
 *       429:
 *         description: Muitas requisições (rate limit)
 */

export {}
