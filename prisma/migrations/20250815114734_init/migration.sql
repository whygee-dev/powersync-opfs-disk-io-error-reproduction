CREATE TABLE "public"."TodoList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "color" TEXT DEFAULT '#3B82F6',

    CONSTRAINT "TodoList_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "todoListId" TEXT NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "public"."Todo" ADD CONSTRAINT "Todo_todoListId_fkey" FOREIGN KEY ("todoListId") REFERENCES "public"."TodoList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE PUBLICATION "powersync" FOR TABLE "public"."TodoList", "public"."Todo";