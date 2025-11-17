-- Renomeia colunas sem perder dados
ALTER TABLE "Task" RENAME COLUMN "parentTaskId" TO "parent_task_id";
ALTER TABLE "Task" RENAME COLUMN "userId" TO "user_id";

-- Opcional: atualiza nomes das constraints para seguir snake_case (preserva as FK)
ALTER TABLE "Task" RENAME CONSTRAINT "Task_parentTaskId_fkey" TO "Task_parent_task_id_fkey";
ALTER TABLE "Task" RENAME CONSTRAINT "Task_userId_fkey" TO "Task_user_id_fkey";
