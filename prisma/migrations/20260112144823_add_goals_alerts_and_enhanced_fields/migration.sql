-- AlterTable: Remove campos antigos do User (kmPerLiter e fuelPrice não são mais necessários)
-- Como esses campos podem ter dados, vamos removê-los apenas se não houver dados críticos
-- Em produção, seria necessário migrar os dados primeiro

-- AlterTable: Adicionar novos campos ao User
ALTER TABLE "users" 
  DROP COLUMN IF EXISTS "km_per_liter",
  DROP COLUMN IF EXISTS "fuel_price",
  ADD COLUMN IF NOT EXISTS "vehicle_type" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "start_year" INTEGER,
  ADD COLUMN IF NOT EXISTS "platforms" JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS "preferences" JSONB DEFAULT '{}'::JSONB;

-- AlterTable: Adicionar novos campos ao Record
ALTER TABLE "records"
  ADD COLUMN IF NOT EXISTS "platforms" JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS "revenue_breakdown" JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS "expense_fuel" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "expense_maintenance" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "expense_food" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "expense_wash" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "expense_toll" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "expense_parking" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "expense_other" DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "trips_count" INTEGER,
  ADD COLUMN IF NOT EXISTS "hours_worked" DECIMAL(4,2),
  ADD COLUMN IF NOT EXISTS "start_time" VARCHAR(5),
  ADD COLUMN IF NOT EXISTS "end_time" VARCHAR(5);

-- AlterTable: Alterar tipo de notes para TEXT (suporta mais caracteres)
ALTER TABLE "records" ALTER COLUMN "notes" TYPE TEXT;

-- CreateTable: Goals (Metas)
CREATE TABLE IF NOT EXISTS "goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target_value" DECIMAL(10,2) NOT NULL,
    "target_period" DATE NOT NULL,
    "current_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "achieved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Alerts (Alertas)
CREATE TABLE IF NOT EXISTS "alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "action_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: Goals
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Alerts
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: Goals
CREATE INDEX IF NOT EXISTS "goals_user_id_idx" ON "goals"("user_id");
CREATE INDEX IF NOT EXISTS "goals_user_id_target_period_idx" ON "goals"("user_id", "target_period");

-- CreateIndex: Alerts
CREATE INDEX IF NOT EXISTS "alerts_user_id_idx" ON "alerts"("user_id");
CREATE INDEX IF NOT EXISTS "alerts_user_id_read_idx" ON "alerts"("user_id", "read");
CREATE INDEX IF NOT EXISTS "alerts_user_id_read_created_at_idx" ON "alerts"("user_id", "read", "created_at");
