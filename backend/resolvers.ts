import { Resolvers, TaskStatus } from "../generated/graphql-backend";
import { UserInputError } from "apollo-server-core";
import { OkPacket } from "mysql";
import mysql from "serverless-mysql";

interface ApolloContext {
  db: mysql.ServerlessMysql;
}

interface TaskDbRow {
  id: number;
  title: string;
  task_status: TaskStatus;
}

type TasksDbQueryResult = TaskDbRow[];

const getTaskById = async (id: number, db: mysql.ServerlessMysql) => {
  const query = "select id, title, task_status FROM tasks WHERE id=?";
  const tasks = await db.query<TasksDbQueryResult>(query, [id]);
  return tasks.length ? { ...tasks[0], status: tasks[0].task_status } : null;
};

export const resolvers: Resolvers<ApolloContext> = {
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
      return tasks.map(({ id, title, task_status }) => ({
        id,
        status: task_status,
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
