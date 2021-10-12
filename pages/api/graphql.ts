import { ApolloServer } from "apollo-server-micro";
import { NextApiRequest, NextApiResponse } from "next";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

import { schema } from "../../backend/schema";
import { db } from "../../backend/db";

const apolloServer = new ApolloServer({
  schema,
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
