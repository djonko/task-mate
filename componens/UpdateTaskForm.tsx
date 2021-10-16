import { isApolloError } from "@apollo/client";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useUpdateTaskMutation } from "../generated/graphql-frontend";

interface Values {
  title: string;
}

interface UpdateTaskFormProps {
  id: number;
  initialValues: Values;
}

const UpdateTaskForm: React.FC<UpdateTaskFormProps> = ({
  id,
  initialValues,
}) => {
  const [values, setValues] = useState<Values>(initialValues);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const [updateTask, { loading, error }] = useUpdateTaskMutation();

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await updateTask({
        variables: { updatedTask: { id, title: values.title } },
      });

      if (result.data?.updateTask) {
        router.push("/");
      }
    } catch (e) {
      // log error
    }
  };

  let errorMessage = "";
  if (error) {
    if (error.networkError) {
      errorMessage = "A network error occured, please try again.";
    } else {
      errorMessage = "Sorry, an error occured.";
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="alert-error">{errorMessage}</p>}
      <p>
        <label htmlFor="title" className="field-label">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          className="text-input"
          value={values.title}
          onChange={handleChange}
        />
      </p>
      <p>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Loading" : "Save"}
        </button>
      </p>
    </form>
  );
};

export default UpdateTaskForm;
