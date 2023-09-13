import { toast } from "react-hot-toast";
import type { Todo } from "../types";
import { api } from "../utils/api";
type TodoProps = {
  todo: Todo;
};

export default function Todo({ todo }: TodoProps) {
  const { id, text, done } = todo;
  const trpc = api.useContext();

  const { mutate: doneMutation } = api.todo.toggleTodos.useMutation({
    onMutate: async ({ id, done }) => {
      //Cancel any outgoing refetching so they dont overwrite our optimistic update
      await trpc.todo.getAlltodo.cancel();

      //snapshot the previous value
      const previousTodos = trpc.todo.getAlltodo.getData();

      //optimistically update to the new value
      trpc.todo.getAlltodo.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.map((t) => {
          if (t.id == id) {
            return {
              ...t,
              done,
            };
          }
          return t;
        });
      });

      return { previousTodos };
    },

    onSuccess: (err, { done }) => {
      if (done) {
        toast.success("Todo completed");
      }
    },
    onError: (err, newTodo, context) => {
      toast.error(
        `An errror occured when setting todo to ${done ? "done" : "undone"}`,
      );
    },

    onSettled: async () => {
      await trpc.todo.getAlltodo.invalidate();
    },
  });

  const { mutate: deleteMutation } = api.todo.deleteTodos.useMutation({
    onMutate: async (deleteId) => {
      //Cancel any outgoing refetching so they dont overwrite our optimistic update
      await trpc.todo.getAlltodo.cancel();

      //snapshot the previous value
      const previousTodos = trpc.todo.getAlltodo.getData();

      //optimistically update to the new value
      trpc.todo.getAlltodo.setData(undefined, (prev) => {
        if (!prev) return previousTodos;
        return prev.filter((t) => t.id !== deleteId);
      });

      return ({ previousTodos });
    },
    onError: (err, newTodo, context) => {
      toast.error("An errror occured when deleting todo");
    },
    onSettled: async () => {
      await trpc.todo.getAlltodo.invalidate();
    },
  });
  return (
    <>
      <div className="my-1 flex items-center justify-between gap-2">
        <div className=" flex items-center justify-between gap-2">
          <input
            className="bg-gray focus:outline-no h-4 w-4 cursor-pointer rounded border border-gray-300"
            type="checkbox"
            name="done"
            id={id}
            checked={done}
            onChange={(e) =>
              doneMutation({
                id,
                done: e.target.checked,
              })
            }
          />
          <label
            htmlFor={id}
            className={`cursor-pointer ${done ? "line-through" : ""}`}
          >
            {text}
          </label>
        </div>
        <button
          className="rounded-md bg-blue-700 px-2 py-2 text-sm text-white hover:bg-blue-800 focus:outline-none focus:ring-4"
          onClick={() => deleteMutation(id)}
        >
          Delete
        </button>
      </div>
    </>
  );
}
