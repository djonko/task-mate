import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import {
  TaskQuery,
  TaskQueryVariables,
  TasksDocument,
  useTaskQuery,
} from "../../generated/graphql-frontend";
import { initializeApollo } from "../../lib/client";
import Error from "next/error";
import UpdateTaskForm from "../../componens/UpdateTaskForm";

interface UpdateTaskProps {}

const UpdateTask: React.FC<UpdateTaskProps> = () => {
  const router = useRouter();
  const id =
    typeof router.query?.id === "string" ? parseInt(router.query?.id, 10) : NaN;
  if (!id) {
    return <Error statusCode={404}></Error>;
  }
  const { data, loading, error } = useTaskQuery({ variables: { id } });
  const task = data?.task;

  return loading ? (
    <p>Loading...</p>
  ) : error ? (
    <p>An error occurred.</p>
  ) : task ? (
    <UpdateTaskForm initialValues={{ title: task.title }} />
  ) : (
    <p>Task not found.</p>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id =
    typeof context.params?.id === "string"
      ? parseInt(context.params?.id, 10)
      : NaN;
  if (id) {
    const appolloClient = initializeApollo();
    await appolloClient.query<TaskQuery, TaskQueryVariables>({
      query: TasksDocument,
      variables: { id },
    });
    return { props: { initializeApolloState: appolloClient.cache.extract() } };
  }
  return { props: {} };
};

export default UpdateTask;
