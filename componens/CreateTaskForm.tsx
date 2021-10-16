import React, { useState } from "react";

interface CreateTaskFormProps {}

const CreateTaskForm: React.FC<CreateTaskFormProps> = () => {
  const [title, setTitle] = useState("");
  const onchangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  return (
    <form>
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
