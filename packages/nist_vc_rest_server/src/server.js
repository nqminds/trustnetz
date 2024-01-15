import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {createRequire} from "node:module";
import express from 'express';
import grpc from "@grpc/grpc-js";
import * as OpenApiValidator from 'express-openapi-validator';
import {v4 as uuidv4} from "uuid";

import { VoltClient } from "@tdxvolt/volt-client-grpc";
import {sign, verify} from "@nqminds/verifiable-schemas-toolchain/src/verifiable-credentials.js"

/**
 * Automatically calls `next(error)` when an `async function` errors.
 *
 * @example
 * router.get("/my-url/path", asyncHandler(async (req, res) => {
 *   // automatically calls next(error) on error
 *   await blah();
 *   res.send("done");
 * }));
 *
 * @template [P=import("express-serve-static-core").ParamsDictionary]
 * @template [ResBody=any]
 * @template [ReqBody=any]
 * @template [ReqQuery=import("express-serve-static-core").Query]
 * @template {Record<string, any>} [LocalsObj=Record<string, any>]
 *
 * @param {(
*  (req: import("express-serve-static-core").Request<P, ResBody, ReqBody, ReqQuery, LocalsObj> & {
  *    user?: import("@nqminds/taibom-client").User},
  *   res: import("express-serve-static-core").Response<ResBody, LocalsObj>
  *  ) => Promise<void>
  * )} asyncHandler - The async handler like `asyc (req, res) => {...}`.
  * There may be a `req.user` object, if the API route is an authenticated API
  * route.
  * @returns {import('express').RequestHandler<P, ResBody, ReqBody, ReqQuery, LocalsObj>}
  * A callback version of the handler.
  */
 function asyncHandler(asyncHandler) {
   return function (req, res, next) {
     Promise.resolve(asyncHandler(req, res)).catch((error) => next(error));
   }
 }
 
 /**
  * @typedef {object} ServerConfig - Config for NIST VC REST server.
  * @property {string} [databaseId] - **Warning**⚠️: This field will be
  * overwritten with the ID of the TDX Volt database to use.
  * @property {string} serverParentId - ID or Alias of TDX VOLT's parent directory
  */
 
 /**
  * Creates an instance of the server API routes.
  *
  * @param {ServerConfig} [config] The configuration object. If not set,
  * will default to the `../config.json` file.
  * @param {string} [voltConfigPath] - The path to the TDX Volt Configuration file.
  * By default, this is the `../volt-config.json` file.
  * @returns {Promise<express.Router>} The express router.
  */
 export default async function server(config, voltConfigPath = fileURLToPath(
   new URL("../volt-config.json", import.meta.url),
 )) {
   const router = express.Router(); // eslint-disable-line new-cap
 
   if (!config) {
     config = /** @type {ServerConfig} */ (JSON.parse(await readFile(
       new URL("../config.json", import.meta.url),
       {encoding: "utf8"}),
     ));
   }

   if (config.voltConfigPath) {
    voltConfigPath = fileURLToPath(new URL(config.voltConfigPath, import.meta.url))
   }

   const client = new VoltClient(grpc);
   await client.initialise(voltConfigPath);
   await client.connect();

   // Body parser middleware
   router.use(express.urlencoded({ extended: false }));
   router.use(express.json());
 
   // checks that all requests/responses match OpenAPI spec
   const require = createRequire(import.meta.url); 
   
   router.use((err, req, res, next) => {
    if (err instanceof OpenApiValidator.error.Unauthorized) {
      // print a login box when trying to access an API route directly
      // workaround for https://github.com/cdimascio/express-openapi-validator/issues/471
      res.header("WWW-Authenticate", 'Basic realm="User Visible Realm", charset="UTF-8"');
    }
    next(err);
  });

  router.get("/hello", asyncHandler(async (req, res) => {
    res.send("hello");
  }));

  router.post("/sign/:schemaName", asyncHandler(async (req, res) => {
    const schemaName = req.params.schemaName;
    const claimBody = req.body;
    const schemaId = `https://github.com/nqminds/nist-brski/blob/main/packages/schemas/src/${schemaName}.yaml`
    const vc = await sign(schemaId, 
      claimBody,
      {client});
    res.send(vc)
  }));

  router.post("/verify/:schemaName", asyncHandler(async (req, res) => {
    const schemaName = req.params.schemaName;
    const vc = req.body;
    const manufacturerTrustSchemaId = `https://github.com/nqminds/nist-brski/blob/main/packages/schemas/src/${schemaName}.yaml`
    const verified = await verify(vc, {client});
    res.send(verified)
  }));
   
   /** Error handling */
   router.use((req, res, next) => {
       const error = new Error('not found');
       return res.status(404).json({
           message: error.message
       });
   });
 
   return router;
 }