# 🍲 MESA SEMANAL — Planificador de Comidas y Compras de Mercado Criollo

> Aplicación web *mobile-first* con estética de delivery (tipo Rappi o LlamaFood) para planificar las comidas del hogar de la semana, generar listas de compras de mercado exactas y controlar de punta a punta lo planificado, lo comprado, lo utilizado y el saldo en despensa.

---

## 🚀 Inicio Rápido (En 1 minuto)

La aplicación viene con **Modo a prueba de fallos** activo de serie. No requiere base de datos ni credenciales externas para empezar a usarse de inmediato.

### Requisitos previos
- **Node.js** v18 o superior instalado.
- **pnpm** (la app usa exclusivamente `pnpm`).

### Comandos de ejecución
Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
# 1. Entrar a la carpeta del proyecto
cd "mesa-semanal"

# 2. Instalar dependencias con pnpm (estricto)
pnpm install

# 3. Iniciar el servidor de desarrollo
pnpm dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000). ¡Listo! Podrás usar la app en tu computadora o en tu celular conectado a la misma red Wi-Fi.

---

## 📱 Módulos y Cómo Usar la App

### 1. Pantalla Principal: Catálogo Estilo Delivery
- **Barra Superior Fija:**
  - **Meta Semanal:** Te muestra cuántos platos principales llevas elegidos (meta sugerida: 7 platos de la semana).
  - **Desplegable de Día:** Elige a qué día quieres asignar (Lunes a Domingo).
  - **Desplegable de Momento:** Elige la comida (Desayuno, Media mañana, Almuerzo, Media tarde, Cena).
  - **Desplegable de Porciones:** Elige para cuántos platos cocinarás (1, 2, 4, 6, etc.).
- **Tarjetas de Platos:**
  - Cada plato tiene su ilustración SVG cálida de mercado, tiempo de preparación y precio referencial en Soles (`S/`).
  - **Insumos para 1 plato:** Debajo de la imagen se detalla la cantidad exacta de ingredientes para 1 persona.
  - Al presionar **"Agregar a [Día] • [Momento]"**, el plato se envía automáticamente al Planificador Semanal.
- **Botón "Crear Plato":** Te permite armar tu propia receta casera indicando los ingredientes para 1 plato y guardarla en el catálogo.
- **Asistente IA:** Te permite pegar una receta en texto libre para que la interprete o sugerir un menú completo según tu presupuesto en Soles.

### 2. Planificador Gráfico Semanal
- Cuadrícula visual de los 7 días (Lunes a Domingo) con sus 5 momentos.
- Muestra los platos agendados con su foto mini, porciones y costo estimado.
- Puedes ajustar porciones con `+` / `-`, quitar platos o marcar un plato como **"Preparado"** para que sus insumos se descuenten automáticamente de la despensa.

### 3. Gestión de Compras en 3 Pilares
- **1. Planificadas:** Totaliza y consolida los ingredientes repetidos de la semana, convierte unidades (gramos a kilos, mililitros a litros), aplica redondeo a presentaciones comerciales (ej. paquetes o atados) y **descuenta lo que ya tienes en stock**. Incluye botón para copiar con formato a **WhatsApp** y botón para **Imprimir**.
- **2. Ejecutadas:** Formulario rápido para anotar lo que compraste en el mercado con su precio real pagado y lugar de compra. Si compras menos de lo planificado, la app te muestra una **alerta de faltante**.
- **3. En Stock / Saldo:** Control de inventario en el hogar bajo la fórmula:
  $$\text{Saldo} = \text{Stock Anterior} + \text{Comprado} - \text{Utilizado}$$

---

## ☁️ Guía Paso a Paso para Conectar Google Sheets (Para no programadores)

Si deseas sincronizar los datos de tu hogar en una hoja de Google Sheets para que tú y tu familia puedan compartir la misma despensa y menú, sigue estos sencillos pasos:

### Paso 1: Crear una Hoja de Cálculo en Google Drive
1. Entra a [Google Sheets](https://sheets.google.com) con tu cuenta de Google.
2. Crea una nueva hoja de cálculo en blanco y nómbrala **"Mesa Semanal - Despensa Familiar"**.
3. Copia el **ID de la hoja** desde la barra de direcciones de tu navegador:
   - Ejemplo de URL: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - El ID es: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`.

### Paso 2: Crear la Cuenta de Servicio en Google Cloud
1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto llamado `Mesa Semanal`.
3. En el menú lateral, ve a **APIs y servicios > Biblioteca**.
4. Busca **"Google Sheets API"** y haz clic en **Habilitar**.
5. Ve a **APIs y servicios > Credenciales**.
6. Haz clic en **+ Crear credenciales > Cuenta de servicio**.
7. Ponle de nombre `mesa-semanal-service` y haz clic en **Crear y continuar** y luego en **Listo**.
8. Haz clic sobre la cuenta de servicio recién creada en la lista.
9. Ve a la pestaña **Claves** > **Agregar clave** > **Crear clave nueva** > Selecciona **JSON** > Haz clic en **Crear**.
10. Se descargará un archivo `.json` en tu computadora. ¡Guárdalo muy bien!

### Paso 3: Compartir la Hoja con la Cuenta de Servicio
1. Abre el archivo `.json` descargado con el Bloc de Notas y copia el campo `client_email` (se ve algo como `mesa-semanal-service@tu-proyecto.iam.gserviceaccount.com`).
2. Abre tu hoja de Google Sheets en el navegador.
3. Haz clic en el botón verde **Compartir** (arriba a la derecha).
4. Pega el correo de la cuenta de servicio, asígnale el rol de **Editor** y desmarca "Notificar a los usuarios". Haz clic en **Compartir**.

### Paso 4: Configurar `.env.local`
1. En la carpeta `mesa-semanal/`, copia el archivo `.env.example` y renómbralo a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Abre `.env.local` y coloca los datos:
   - `GOOGLE_SHEET_ID`: El ID de tu hoja que copiaste en el Paso 1.
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: El correo de la cuenta de servicio.
   - `GOOGLE_PRIVATE_KEY`: El campo `private_key` de tu archivo `.json` (con sus comillas).
   - `ALLOWED_EMAILS`: Los correos de Gmail de las personas de tu casa que tienen acceso (separados por coma).

---

## 🧪 Pruebas Unitarias y Calidad

Para verificar la integridad matemática de los algoritmos (consolidación de ingredientes, conversión métrica, redondeo a paquetes y saldo de inventario), ejecuta:

```bash
# Correr pruebas unitarias con Vitest
pnpm test

# Verificar formato y linting
pnpm lint

# Compilar para producción
pnpm build
```

---

## 🎨 Paleta Criolla y Diseño
- **Crema de mercado:** `#FDFBF7` / `#F5EFE6`
- **Ají amarillo:** `#D97706` / `#F59E0B`
- **Verde culantro:** `#15803D` / `#166534`
- **Terracota:** `#C2410C` / `#9A3412`
- **Grafito:** `#1F2937`
- Moneda: Soles (`S/`)
- Cero dependencias externas de imágenes: 15 ilustraciones vectoriales SVG locales en `public/images/dishes/`.
