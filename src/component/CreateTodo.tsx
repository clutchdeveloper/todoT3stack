import React, { useState } from "react";
import { todoInput } from "@/types";
import { toast } from "react-hot-toast";
import { api } from "@/utils/api";

export default function CreateTodo() {
  const [newTodo, setNewTodo] = useState("");

  const trpc = api.useContext();

  const { mutate } = api.todo.createTodos.useMutation({
    onMutate: async (newTodo) => {
      //Cancel any outgoing refetching so they dont overwrite our optimistic update
      await trpc.todo.getAlltodo.cancel();

      //snapshot the previous value
      const previousTodos = trpc.todo.getAlltodo.getData();

      //optimistically update to the new value
      trpc.todo.getAlltodo.setData(undefined, (prev) => {
        const optimisticTodo = {
          id: "optimistic-todo-id",
          text: newTodo,
          done: false,
        };
        if (!prev) return [optimisticTodo];
        return [...prev, optimisticTodo];
      });

      setNewTodo("");

      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      toast.error("An errror occured when creating todo");
      setNewTodo(newTodo);
      trpc.todo.getAlltodo.setData(undefined, (prev) => context?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.getAlltodo.invalidate();
    },
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          const result = todoInput.safeParse(newTodo);

          if (!result.success) {
            toast.error(result.error.format()._errors.join("\n"));
            return null;
          }
          //create todo mutation

          mutate(newTodo);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          className="focus:outline-no rounded-md border bg-gray-500  bg-gray-900 p-2 text-sm text-white"
          placeholder="New Todo..."
          id="new-todo"
          name="new-todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button className="rounded-md bg-blue-700 px-2 py-1  text-white hover:bg-blue-800  focus:outline-none focus:ring-4">
          Create
        </button>
      </form>
    </div>
  );
}
