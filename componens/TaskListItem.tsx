import { Reference } from "@apollo/client";
import Link from "next/link";
import React, { useEffect } from "react";
import { Task, useDeleteTaskMutation } from "../generated/graphql-frontend";

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

  return (
    <li key={task.id} className="task-list-item">
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
