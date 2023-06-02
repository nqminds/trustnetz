import { readFile } from "node:fs/promises";

import express from 'express';
import * as OpenApiValidator from 'express-openapi-validator';
import yaml from "js-yaml";

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
 *    user?: import("@nqminds/net-zero-certs-client").User},
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
 * Creates an instance of the server API routes.
 *
 * @returns {Promise<express.Router>} The express router.
 */
export default async function server() {
  const router = express.Router(); // eslint-disable-line new-cap

  const openapiSpecFilename = new URL('../openapi.yaml', import.meta.url);
  /** @type {import("express-openapi-validator/dist/framework/types").OpenAPIV3.Document} */
  const openapiSpec = yaml.load(
    await readFile(openapiSpecFilename, {encoding: "utf8"}),
    {
      filename: openapiSpecFilename,
      schema: yaml.JSON_SCHEMA,
    },
  );

  // checks that all requests/responses match OpenAPI spec
  router.use(OpenApiValidator.middleware({
    apiSpec: openapiSpec,
    validateRequests: true, // throw error if any requests don't match spec
    validateResponses: true, // throw error if any responses don't match spec
  }));

  router.get("/devices", asyncHandler(async (req, res) => {
    res.json(openapiSpec.paths["/devices"].get.responses["200"].content["application/json"].schema.example);
  }));

  router.get("/devices/:device", asyncHandler(async (req, res) => {
    res.json(openapiSpec.components.schemas.Device.example);
  }));

  router.get("/devices/:device/brski", asyncHandler(async (req, res) => {
    res.json(openapiSpec.components.schemas.DeviceBrskiStatus.example);
  }));

  router.get("/devices/:device/brski/logs", asyncHandler(async (req, res) => {
    res.json(openapiSpec.components.schemas.DeviceBrskiLogs.example);
  }));

  router.post("/devices/:device/brski/reset", asyncHandler(async (req, res) => {
    res.send("Success.");
  }));

  router.get("/logs", asyncHandler(async (req, res) => {
    res.json({logs: "Example log"});
  }));

  return router;
}
