import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { todoInput } from "@/types";
import { TRPCError } from "@trpc/server";

export const todoRouter = createTRPCRouter({
  getAlltodo: protectedProcedure.query(async ({ ctx }) => {
    const todos = await ctx.db.todo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return todos.map(({ id, text, done }) => ({ id, text, done }));
  }),

  createTodos: protectedProcedure
    .input(todoInput)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.todo.create({
        data: {
          text: input,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),

  deleteTodos: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.todo.delete({
        where: {
          id: input,
        },
      });
    }),

  toggleTodos: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        done: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input: { id, done } }) => {
      return ctx.db.todo.update({
        where: {
          id,
        },
        data: {
          done,
        },
      });
    }),
});
