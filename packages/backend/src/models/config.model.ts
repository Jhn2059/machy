import prisma from '../config/database';

export const configModel = {
  async getAll() {
    return prisma.systemConfig.findMany();
  },

  async getValue(key: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    return config?.value || null;
  },

  async upsertConfigs(configs: Array<{ key: string; value: string }>) {
    const results = [];
    for (const c of configs) {
      const result = await prisma.systemConfig.upsert({
        where: { key: c.key },
        update: { value: c.value },
        create: { key: c.key, value: c.value },
      });
      results.push(result);
    }
    return results;
  },
};
