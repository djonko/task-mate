import React, { useState } from "react";
import { useCreateTaskMutation } from "../generated/graphql-frontend";

interface CreateTaskFormProps {
  onSuccess: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState("");
  const onchangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const [createTask, { loading, error }] = useCreateTaskMutation({
    onCompleted: () => {
      onSuccess();
      setTitle("");
    },
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loading) {
      try {
        await createTask({ variables: { input: { title: title } } });
      } catch (e) {
        // log error
      }
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="alert-error">An error occurred.</p>}
      <input
        type="text"
        name="title"
        id=""
        placeholder="What would you like to get done?"
        autoComplete="off"
        className="text-input new-task-text-input"
        value={title}
        onChange={onchangeTitle}
      />
    </form>
  );
};

export default CreateTaskForm;
