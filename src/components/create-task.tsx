"use client";

import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useState } from "react";
import { api } from "~/trpc/react";
import styles from "./create-task.module.css";
import { type Task } from "./task-list";

export function CreateTask() {
  const [text, setText] = useState("");
  // this is the new mutation
  const createTask = api.tasks.addTask.useMutation();

  // we use the query client to update the data in the caches
  const queryClient = useQueryClient();
  
  // not used now, but would be used if you loaded the data using a server component
  // const router = useRouter();

  return (
    <>
      <input
        type="text"
        value={text}
        placeholder="What needs to be done?"
        className={styles.taskInput}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        disabled={createTask.isPending}
        className={styles.taskButton}
        onClick={() => {
          // call the mutation
          createTask.mutate(
            {
              description: text
            },
            {
              onSuccess(data) {
                // update the cache on the client
                // 1. find the key by which the data is identified ion the cache
                const key = getQueryKey(api.tasks.tasks, undefined, "query");
                // 2. read the data in the cache
                const existing = queryClient.getQueryData<Task[]>(key) ?? [];
                // 3. write the new data to the cache
                queryClient.setQueryData(key, [...existing, data]);
                
                /*
                 * if you use Server Component to get your data, you do 
                 * not need to worry about this cache, but call
                 * router.refresh() instead 
                 */
              }
            }
          );
        }}
      >
        {createTask.isPending ? "Saving" : "Add Task"}
      </button>
    </>
  );
}