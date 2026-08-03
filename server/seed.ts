import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { stores, users, financialCategories } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  const existingStores = await db.select().from(stores);
  let firstStore = existingStores[0];

  if (existingStores.length === 0) {
    const seeded = await db.insert(stores).values([
      { code: 'SP1', name: 'São Paulo - SP1', color: '#2563eb', cidade: 'São Paulo', uf: 'SP' },
      { code: 'SP2', name: 'São Paulo - SP2', color: '#000000', cidade: 'São Paulo', uf: 'SP' },
      { code: 'SOR', name: 'Sorocaba - SOR', color: '#16a34a', cidade: 'Sorocaba', uf: 'SP' },
    ]).returning();
    firstStore = seeded[0];
    console.log("Lojas criadas: SP1, SP2, SOR (edite os dados fiscais em Lojas antes de emitir notas reais).");
  } else {
    console.log("Lojas já existentes, mantendo como estão.");
  }

  const existingCategories = await db.select().from(financialCategories);
  if (existingCategories.length === 0) {
    await db.insert(financialCategories).values([
      { name: 'Aluguel', type: 'expense' },
      { name: 'Água / Energia / Internet', type: 'expense' },
      { name: 'Salários e Encargos', type: 'expense' },
      { name: 'Peças e Insumos', type: 'expense' },
      { name: 'Manutenção e Equipamentos', type: 'expense' },
      { name: 'Marketing', type: 'expense' },
      { name: 'Impostos e Taxas', type: 'expense' },
      { name: 'Outras Despesas', type: 'expense' },
      { name: 'Serviços (Ordens de Serviço)', type: 'income' },
      { name: 'Venda de Peças', type: 'income' },
      { name: 'Outras Receitas', type: 'income' },
    ]);
    console.log("Categorias financeiras padrão criadas.");
  } else {
    console.log("Categorias financeiras já existentes, mantendo como estão.");
  }

  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0 && firstStore) {
    await db.insert(users).values({
      username: 'admin',
      password: await hashPassword('admin123'),
      name: 'Administrador',
      email: 'admin@bjr.com.br',
      role: 'admin',
      storeId: firstStore.id,
    });
    console.log("Usuário admin criado - username: admin / senha: admin123 (troque a senha antes de ir para produção).");
  } else {
    console.log("Usuários já existentes, mantendo como estão.");
  }

  console.log("Seed concluído.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Falha ao popular dados iniciais:", err);
  process.exit(1);
});
