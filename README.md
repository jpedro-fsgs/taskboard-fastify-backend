# Taskboard Fastify Backend

Descrição do repositório do backend de uma aplicação de quadro de tarefas (taskboard) desenvolvida com arquitetura modular em TypeScript.

**Visão geral**
- **Propósito:** API backend para gerenciar usuários, autenticação e tarefas em um formato de quadro/kanban.
- **Abordagem:** API HTTP JSON organizada em módulos (controllers, services, routes, schemas) para manter separação de responsabilidades.

**Principais tecnologias**
- **Linguagem:** TypeScript
- **Framework HTTP:** Fastify
- **ORM:** Prisma (migrations presentes em `prisma/migrations`)
- **Autenticação:** JWT (configuração em `src/utils/jwt.config.ts`)
 
**Swagger UI**

![Swagger UI](screenshots/Screenshot%20Swagger%20UI.png)

**Estrutura do projeto (visão resumida)**
- `src/server.ts`: ponto de entrada da aplicação.
- `src/modules/`:
  - `auth/`: rotas, controller e service de autenticação (`auth.route.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.schema.ts`).
  - `user/`: endpoints e lógica relacionados a usuários (`users.route.ts`, `users.controller.ts`, `users.service.ts`, `users.schema.ts`).
  - `task/`: endpoints e lógica de tarefas (`tasks.route.ts`, `tasks.controller.ts`, `tasks.service.ts`, `tasks.schema.ts`).
- `src/utils/`: cliente Prisma (`prisma.ts`), tipos (`types.ts`), utilitários (`utils.ts`) e configuração JWT.
- `prisma/`: esquema do banco e histórico de migrations.

**Funcionalidades principais**
- Gerenciamento de usuários (criar/recuperar dados de usuário).
- Autenticação baseada em JWT (login/validação de token).
- CRUD básico de tarefas com validações via schemas.
- Estrutura de testes com arquivos de teste próximos às funções testadas (`*.test.ts`).

**Qualidade e arquitetura**
- Organização modular que facilita manutenção e testes unitários.
- Separação clara entre camada de rota, controlador e serviço.
- Uso de migrations do Prisma para versionamento do esquema de banco.

**Como rodar (desenvolvimento)**

- Instale dependências: `npm install`
- Defina as variáveis de ambiente necessárias (por exemplo `DATABASE_URL` e `JWT_SECRET`). Você pode criar um arquivo `.env` na raiz com as variáveis apropriadas.
- (Opcional) Rode as migrations do Prisma se necessário: `npx prisma migrate dev --name init`.
- Inicie em modo desenvolvimento: `npm run dev` (o script usa `tsx watch src/server.ts`).

Exemplo de comandos (bash):
```
npm install
# export DATABASE_URL='sua_database_url_aqui'
# export JWT_SECRET='sua_chave_secreta_aqui'
npx prisma migrate dev --name init
npm run dev
```

**Schema do Banco de Dados**

- O projeto utiliza Prisma; o schema principal está em `prisma/schema.prisma`.
- Principais models:
  - **User**: `id` (UUID), `username` (único), `name` (opcional), `hashed_password`, relaciona-se com `Task` (1:N).
  - **Task**: `id` (UUID), `title`, `description` (opcional), `is_done` (boolean), `deleted_at` (soft-delete), `user_id` (FK para `User`). Suporta subtarefas via self-relation (`parent_task_id` / `sub_tasks`).

- Mais detalhes do schema podem ser vistos em `prisma/schema.prisma`.

Diagrama do banco:

![Taskboard Database](screenshots/taskboard%20database.png)

Arquivos de referência rápida:
- `src/server.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/user/users.service.ts`
- `src/modules/task/tasks.controller.ts`
- `src/utils/prisma.ts`
- `prisma/schema.prisma`

Este repositório foca na implementação do backend e na organização do código em módulos claros para suportar APIs REST robustas e testáveis.
