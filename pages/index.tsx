import Head from "next/head";
import CreateTaskForm from "../componens/CreateTaskForm";
import TaskList from "../componens/TaskList";
import {
  TasksDocument,
  TasksQuery,
  useTasksQuery,
} from "../generated/graphql-frontend";
import { initializeApollo } from "../lib/client";

export default function Home() {
  const result = useTasksQuery();
  const data = result.data;
  const loading = result.loading;
  const error = result.error;
  const tasks = data?.tasks;
  return (
    <div>
      <Head>
        <title>Tasks</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CreateTaskForm
        onSuccess={() => {
          result.refetch();
        }}
      />
      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p>An error occurred.</p>
      ) : tasks && tasks.length > 0 ? (
        <TaskList tasks={tasks} />
      ) : (
        <p className="no-tasks-message"></p>
      )}
    </div>
  );
}

export const getStaticProps = async () => {
  const apolloClient = initializeApollo();
  await apolloClient.query<TasksQuery>({ query: TasksDocument });
  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};
