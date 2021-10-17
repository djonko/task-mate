import { Reference } from "@apollo/client";
import Link from "next/link";
import React, { useEffect } from "react";
import {
  Maybe,
  Task,
  TaskStatus,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from "../generated/graphql-frontend";

interface TaskListItemProps {
  task: Task;
}

const TaskListItem: React.FC<TaskListItemProps> = ({ task }) => {
  const [deleteTask, { loading, error }] = useDeleteTaskMutation({
    variables: { idTaskToDelete: task.id },
    errorPolicy: "all",
    // this help us to update apollo cache afert action like (update, delete)
    update: (cache, result) => {
      const deletedTask = result.data?.deleteTask;
      if (deletedTask) {
        cache.modify({
          fields: {
            tasks(taskRefs: Reference[], { readField }) {
              return taskRefs.filter((taskRef) => {
                return readField("id", taskRef) !== deletedTask.id;
              });
            },
          },
        });
      }
    },
  });
  const handleDeleteClick = async () => {
    try {
      await deleteTask();
    } catch (error) {}
  };
  useEffect(() => {
    if (error) {
      alert("An error occurred, please try again.");
    }
  }, [error]);

  const [updateTask, { loading: updateTaskLoading, error: updateTaskError }] =
    useUpdateTaskMutation({
      errorPolicy: "all",
    });
  const handleStatusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked
      ? TaskStatus.Completed
      : TaskStatus.Active;
    await updateTask({
      variables: { updatedTask: { id: task.id, status: newStatus } },
    });
  };

  useEffect(() => {
    if (updateTaskError) {
      alert("An error occurred, please try again.");
    }
  }, [updateTaskError]);

  return (
    <li key={task.id} className="task-list-item">
      <label className="checkbox">
        <input
          type="checkbox"
          onChange={handleStatusChange}
          checked={task.status === TaskStatus.Completed}
          disabled={updateTaskLoading}
        />
        <span className="checkbox-mark">&#10003;</span>
      </label>
      <Link href="/update/[id]" as={`/update/${task.id}`}>
        <a className="task-list-item-title">{task.title}</a>
      </Link>
      <button
        className="task-list-item-delete"
        onClick={handleDeleteClick}
        disabled={loading}
      >
        &times;
      </button>
    </li>
  );
};

export default TaskListItem;
