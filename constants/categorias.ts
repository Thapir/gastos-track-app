export type CategoriaFija = {
  label: string;
  value: string;
  bgColor: string;
  iconName: string;
};

export const CATEGORIAS_FIJAS: CategoriaFija[] = [
  { label: 'Comida',       value: 'comida',       bgColor: '#ef4444', iconName: 'ForkKnife'      },
  { label: 'Transporte',   value: 'transporte',   bgColor: '#f97316', iconName: 'Car'            },
  { label: 'Salud',        value: 'salud',        bgColor: '#22c55e', iconName: 'FirstAid'       },
  { label: 'Hogar',        value: 'hogar',        bgColor: '#3b82f6', iconName: 'House'          },
  { label: 'Ocio',         value: 'ocio',         bgColor: '#a855f7', iconName: 'GameController'  },
  { label: 'Ropa',         value: 'ropa',         bgColor: '#ec4899', iconName: 'TShirt'         },
  { label: 'Educacion',    value: 'educacion',    bgColor: '#06b6d4', iconName: 'BookOpen'       },
  { label: 'Otros',        value: 'otros',        bgColor: '#737373', iconName: 'Coins'          },
];

export const COLORES_DISPONIBLES = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#a855f7', '#ec4899',
  '#14b8a6', '#f43f5e', '#8b5cf6', '#737373',
];
