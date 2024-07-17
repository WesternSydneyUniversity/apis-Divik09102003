import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Sample in-memory data store for tasks

export const tasksRouter = createTRPCRouter({
  tasks: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      where : { userId: ctx.session.user.id },
    });
  }),

  addTask: protectedProcedure
    .input(z.object({ description: z.string() }))
    .mutation(async ({ ctx, input }) => {

      const newTask = 
        await ctx.db.task.create({data: {userId: ctx.session.user.id,
        description: input.description,
        completed: false
      },
    });
    return newTask;
    }),

  changeTask: protectedProcedure
    .input(z.object({ id: z.number(), description: z.string(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const updatedTask = await ctx.db.task.update({
          where: { id: input.id },
          data: { description: input.description, completed: input.completed }
        });
      return updatedTask;
    }),

  deleteTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const deletedTask = await ctx.db.task.delete({ where: { id: input.id }, 
      });
      return deletedTask;
    }),
});
