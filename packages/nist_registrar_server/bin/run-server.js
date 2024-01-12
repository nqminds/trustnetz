#!/usr/bin/env node

import http from 'node:http';
import { promisify } from 'node:util';
import express from "express";
import server from "../src/server.js";

const PORT = process.env.PORT ?? 3001;

async function main() {
  const app = express();

  /** Setup CORS so that other websites can access this server */
  app.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, POST');
        return res.status(200).json({});
    }
    next();
  });

  console.warn(
    "CORS: Allowing API connections from any origin.\n" +
    "This is a potential security risk."
  );

  const router = await server();
  app.use(router);

  const httpServer = http.createServer(app);

  await promisify(httpServer.listen).bind(httpServer)(PORT);

  console.log(`The server is running on port ${PORT}`)
}

main().catch((error) => {
  console.error("Starting the server failed with: ", error);
  process.exitCode = 1;
});