# Apex — Frontend

Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript.

## Comandos

```bash
pnpm install   # instalar dependencias
pnpm dev       # servidor de desarrollo (http://localhost:3000)
pnpm build     # build de producción
pnpm lint      # eslint
```

## Estructura

```
app/
├── layout.tsx              # Solo <html> y <body> + globals.css
├── (auth)/                 # Sin Sidebar: login, register
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
└── (app)/                  # Con Sidebar: rutas autenticadas
    ├── layout.tsx
    ├── routines/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── [id]/page.tsx
    └── workout-sessions/
        ├── page.tsx
        └── [id]/page.tsx
components/
├── ui/                     # Primitivas reutilizables: Button, Input, Card
├── layout/                 # Shell de la app: Sidebar, Logo
└── features/               # Componentes por dominio
    ├── auth/
    ├── routines/
    └── workout-sessions/
lib/                        # api.ts, auth.ts, utils.ts
types/                      # Modelos de dominio
data/                       # Labels y datos estáticos
public/
proxy.ts                    # Protección de rutas + redirección de auth
```

## Convenciones

- **Layouts**: el `app/layout.tsx` raíz no debe contener UI de la app. La zona autenticada vive en `(app)/` (con Sidebar) y la pública en `(auth)/` (sin Sidebar). Los route groups no afectan las URLs.
- **Componentes**: las primitivas (botones, inputs, tarjetas) van en `components/ui/`; el shell de la app en `components/layout/`; y los componentes específicos de una feature en `components/features/<dominio>/`. Una feature nueva crea su carpeta bajo `components/features/`.
- **Rutas protegidas**: se registran en `proxy.ts` dentro de `PROTECTED_PREFIXES` y el `matcher`. El Sidebar y el proxy deben mantenerse en sincronía.