import { ApolloServer, gql } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  UserInputError,
} from "apollo-server-core";
import mysql from "serverless-mysql";
import { OkPacket } from "mysql";
import { Resolvers, TaskStatus } from "../../generated/graphql-backend";

interface ApolloContext {
  db: mysql.ServerlessMysql;
}

interface TaskDbRow {
  id: number;
  title: string;
  taskStatus: TaskStatus;
}

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

type TasksDbQueryResult = TaskDbRow[];
type TaskDbQueryResult = TaskDbRow[];

const typeDefs = gql`
  enum TaskStatus {
    active
    completed
  }
  type Task {
    id: Int!
    title: String!
    status: TaskStatus
  }
  input CreateTaskInput {
    title: String!
  }

  input UpdateTaskInput {
    id: Int!
    title: String
    status: TaskStatus
  }
  type Query {
    tasks(status: TaskStatus): [Task!]!
    task(id: Int!): Task
  }
  type Mutation {
    createTask(input: CreateTaskInput!): Task
    updateTask(input: UpdateTaskInput!): Task
    deleteTask(id: Int!): Task
  }
`;

const getTaskById = async (id: number, db: mysql.ServerlessMysql) => {
  const query = "select id, title, task_status FROM tasks WHERE id=?";
  const tasks = await db.query<TasksDbQueryResult>(query, [id]);
  return tasks.length ? { ...tasks[0], status: tasks[0].taskStatus } : null;
};

const resolvers: Resolvers<ApolloContext> = {
  Query: {
    async tasks(parent, args, context) {
      const { status } = args;
      let query = "select id, title, task_status FROM tasks";
      const queryParams = [];
      if (status) {
        query += " WHERE task_status = ? ";
        queryParams.push(status);
      }
      const tasks = await context.db.query<TasksDbQueryResult>(
        query,
        queryParams
      );
      await context.db.end();
      return tasks.map(({ id, title, taskStatus }) => ({
        id,
        status: taskStatus,
        title,
      }));
    },
    async task(parent, args, context) {
      const { id } = args;
      return getTaskById(id, context.db);
    },
  },
  Mutation: {
    async createTask(parent, args: { input: { title: string } }, context) {
      const query = "INSERT INTO tasks (title, task_status) VALUES (?, ?)";
      const { title } = args.input;
      const result = await context.db.query<OkPacket>(query, [
        title,
        TaskStatus.Active,
      ]);
      await context.db.end();
      return { id: result.insertId, status: TaskStatus.Active, title };
    },
    async updateTask(parent, args, context) {
      const updatedTask = args.input;
      let query = "UPDATE tasks set id = id";
      const queryParams = [];
      if (updatedTask.status) {
        query += ", task_status=?";
        queryParams.push(updatedTask.status);
      }
      if (updatedTask.title) {
        query += ", title=?";
        queryParams.push(updatedTask.title);
      }
      query += " WHERE id=?";
      queryParams.push(updatedTask.id);
      await context.db.query<OkPacket>(query, queryParams);
      return await getTaskById(updatedTask.id, context.db);
    },
    async deleteTask(parent, args, context) {
      const { id } = args;
      const deletedTask = await getTaskById(id, context.db);
      if (!deletedTask) throw new UserInputError("Could not find your task");
      const query = "DELETE FROM tasks WHERE id = ?";
      await context.db.query<OkPacket>(query, [id]);
      return deletedTask;
    },
  },
};

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
});

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: { db },
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

const startServer = apolloServer.start();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

/*
// version sans graphqlPlayGround
const startServer = apolloServer.start();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://studio.apollographql.com"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  if (req.method === "OPTIONS") {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

*/
