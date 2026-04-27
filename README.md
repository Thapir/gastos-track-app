# Gastos Track App

App movil para llevar el control de tus gastos personales. Define un presupuesto mensual, registra tus gastos por categoria, y revisa tu historial mes a mes.

Construida con **Expo** + **React Native** + **TypeScript**.

## Caracteristicas

- **Autenticacion local** con email/contrasena (preparada para migrar a Firebase)
- **Modo invitado** para usar la app sin crear cuenta
- **Dashboard mensual** con total gastado y barra de progreso del presupuesto
- **Presupuesto editable** por mes — el restante se actualiza con cada gasto
- **Categorias fijas** (Comida, Transporte, Salud, Hogar, Ocio, Ropa, Educacion, Otros)
- **Categorias personalizadas** que puedes crear con nombre y color
- **Agregar / editar / eliminar** gastos en cualquier momento
- **Cierre de mes manual o automatico** — al cambiar de mes se guarda en el historial
- **Historial completo** de meses cerrados con detalle por categoria
- **Persistencia local** usando AsyncStorage (sin necesidad de internet)

## Tecnologias

- [Expo SDK 53](https://expo.dev/) — entorno de React Native
- [Expo Router](https://docs.expo.dev/router/introduction/) — navegacion basada en archivos
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) — animaciones
- [Phosphor Icons](https://phosphoricons.com/) — iconos
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) — almacenamiento local

## Estructura del proyecto

```
app/
  index.tsx              → Splash con logo
  _layout.tsx            → Layout raiz con manejo de auth
  auth/
    welcome.tsx          → Pantalla de bienvenida
    login.tsx            → Iniciar sesion
    registrar.tsx        → Registro
  (tabs)/
    _layout.tsx          → Tab navigator
    index.tsx            → Dashboard del mes actual
    historial.tsx        → Meses cerrados
    ajustes.tsx          → Perfil y opciones
  gasto/
    agregar.tsx          → Agregar / editar gasto

components/               → Componentes reutilizables (Boton, Input, Typo, etc.)
constants/                → Tema, colores, categorias fijas
context/AuthContext.tsx   → Estado global de autenticacion
utils/
  storage.ts              → Helper de AsyncStorage
  authService.ts          → Login / registro local
  gastosService.ts        → CRUD de gastos, presupuesto y cierre de mes
```

## Como ejecutar

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Thapir/gastos-track-app.git
cd gastos-track-app
npm install
```

### 2. Iniciar el servidor de desarrollo

```bash
npx expo start
```

### 3. Abrir la app

Tienes varias opciones:

- **Expo Go (recomendado)** — instala [Expo Go](https://expo.dev/go) en tu celular y escanea el codigo QR
- **Emulador Android** — presiona `a` en la terminal (requiere Android Studio)
- **Simulador iOS** — presiona `i` (solo Mac)
- **Web** — presiona `w`

### Si tienes problemas de red

Prueba el modo tunel para esquivar firewalls o redes restrictivas:

```bash
npx expo start --tunnel
```

## Como funciona el cierre de mes

- **Manual:** desde el Dashboard, boton "Cerrar mes manualmente". Guarda los gastos del mes actual en el historial y deja el dashboard limpio para el mes siguiente.
- **Automatico:** los primeros 3 dias de cada mes, la app revisa si el mes anterior fue cerrado. Si no lo fue, lo cierra automaticamente.

Cada mes cerrado se guarda con su total, lista de gastos y desglose por categoria.

## Roadmap

- [ ] Migrar autenticacion a Firebase
- [ ] Sincronizacion en la nube (Firestore)
- [ ] Graficos de gastos por categoria
- [ ] Exportar historial a PDF / CSV
- [ ] Recordatorios de presupuesto

## Licencia

Proyecto personal de aprendizaje. Libre para usar y modificar.
