import { storage } from './storage';

export type Gasto = {
  id: string;
  userId: string;
  monto: number;
  categoria: string;
  descripcion: string;
  fecha: string; // ISO date string
  mes: number;   // 0-11
  año: number;
};

export type MesCerrado = {
  mes: number;
  año: number;
  total: number;
  gastos: Gasto[];
  cerradoEn: string;
};

export type CategoriaCustom = {
  id: string;
  userId: string;
  label: string;
  value: string;
  bgColor: string;
};

const gastosKey = (userId: string) => `gastos_${userId}`;
const mesesKey = (userId: string) => `meses_${userId}`;
const categoriasKey = (userId: string) => `categorias_custom_${userId}`;
const presupuestoKey = (userId: string, mes: number, año: number) =>
  `presupuesto_${userId}_${año}_${mes}`;

// ─── Gastos ────────────────────────────────────────────────────────────────

export const gastosService = {
  getAll: async (userId: string): Promise<Gasto[]> => {
    return (await storage.get<Gasto[]>(gastosKey(userId))) ?? [];
  },

  getMesActual: async (userId: string): Promise<Gasto[]> => {
    const now = new Date();
    const todos = await gastosService.getAll(userId);
    return todos.filter((g) => g.mes === now.getMonth() && g.año === now.getFullYear());
  },

  agregar: async (
    userId: string,
    data: Omit<Gasto, 'id' | 'userId' | 'mes' | 'año'>
  ): Promise<Gasto> => {
    const todos = await gastosService.getAll(userId);
    const fecha = new Date(data.fecha);
    const nuevo: Gasto = {
      ...data,
      id: Date.now().toString(),
      userId,
      mes: fecha.getMonth(),
      año: fecha.getFullYear(),
    };
    await storage.set(gastosKey(userId), [...todos, nuevo]);
    return nuevo;
  },

  eliminar: async (userId: string, gastoId: string): Promise<void> => {
    const todos = await gastosService.getAll(userId);
    await storage.set(
      gastosKey(userId),
      todos.filter((g) => g.id !== gastoId)
    );
  },

  editar: async (
    userId: string,
    gastoId: string,
    data: Omit<Gasto, 'id' | 'userId' | 'mes' | 'año'>
  ): Promise<void> => {
    const todos = await gastosService.getAll(userId);
    const fecha = new Date(data.fecha);
    const actualizado: Gasto = {
      ...data,
      id: gastoId,
      userId,
      mes: fecha.getMonth(),
      año: fecha.getFullYear(),
    };
    await storage.set(
      gastosKey(userId),
      todos.map((g) => (g.id === gastoId ? actualizado : g))
    );
  },

  // ─── Cierre de mes ────────────────────────────────────────────────────────

  cerrarMes: async (userId: string, mes: number, año: number): Promise<void> => {
    const todos = await gastosService.getAll(userId);
    const delMes = todos.filter((g) => g.mes === mes && g.año === año);
    const total = delMes.reduce((acc, g) => acc + g.monto, 0);

    const meses = (await storage.get<MesCerrado[]>(mesesKey(userId))) ?? [];
    const yaCerrado = meses.find((m) => m.mes === mes && m.año === año);
    if (!yaCerrado) {
      await storage.set(mesesKey(userId), [
        ...meses,
        { mes, año, total, gastos: delMes, cerradoEn: new Date().toISOString() },
      ]);
    }

    // Eliminar del registro activo los gastos cerrados
    await storage.set(
      gastosKey(userId),
      todos.filter((g) => !(g.mes === mes && g.año === año))
    );
  },

  getMesesCerrados: async (userId: string): Promise<MesCerrado[]> => {
    const meses = (await storage.get<MesCerrado[]>(mesesKey(userId))) ?? [];
    return meses.sort((a, b) => {
      if (a.año !== b.año) return b.año - a.año;
      return b.mes - a.mes;
    });
  },

  // ─── Categorias custom ────────────────────────────────────────────────────

  getCategoriasCustom: async (userId: string): Promise<CategoriaCustom[]> => {
    return (await storage.get<CategoriaCustom[]>(categoriasKey(userId))) ?? [];
  },

  agregarCategoriaCustom: async (
    userId: string,
    data: Omit<CategoriaCustom, 'id' | 'userId'>
  ): Promise<CategoriaCustom> => {
    const lista = await gastosService.getCategoriasCustom(userId);
    const nueva: CategoriaCustom = { ...data, id: Date.now().toString(), userId };
    await storage.set(categoriasKey(userId), [...lista, nueva]);
    return nueva;
  },

  eliminarCategoriaCustom: async (userId: string, catId: string): Promise<void> => {
    const lista = await gastosService.getCategoriasCustom(userId);
    await storage.set(
      categoriasKey(userId),
      lista.filter((c) => c.id !== catId)
    );
  },

  // ─── Presupuesto ──────────────────────────────────────────────────────────

  getPresupuesto: async (userId: string, mes: number, año: number): Promise<number | null> => {
    return await storage.get<number>(presupuestoKey(userId, mes, año));
  },

  setPresupuesto: async (userId: string, mes: number, año: number, monto: number): Promise<void> => {
    await storage.set(presupuestoKey(userId, mes, año), monto);
  },
};
