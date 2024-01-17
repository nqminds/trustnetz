import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {createRequire} from "node:module";
import express from 'express';
import grpc from "@grpc/grpc-js";
import * as OpenApiValidator from 'express-openapi-validator';
import {v4 as uuidv4} from "uuid";
import http from 'http';
import sqlite3 from "sqlite3";
import util from 'util';

import intitialise_demo_database from "./initialise_demo_database.js";
import handle_device_trust from "./handle_device_trust.js"
import handle_manufacturer_trust from "./handle_manufacturer_trust.js";
import handle_device_type_binding from "./handle_device_type_binding.js";
import handle_device_type_vulnerable from "./handle_device_type_vulnerability_binding.js";

function httpsPost({url, body, ...options}) {
    return new Promise((resolve,reject) => {
        const req = http.request(url, {
            method: 'POST',
            ...options,
        }, res => {
            const chunks = [];
            res.on('data', data => chunks.push(data))
            res.on('end', () => {
                let resBody = Buffer.concat(chunks);
                switch(res.headers['content-type']) {
                    case 'application/json':
                        resBody = JSON.parse(resBody);
                        break;
                }
                resolve(resBody)
            })
        })
        req.on('error',reject);
        if(body) {
            req.write(body);
        }
        req.end();
    })
}
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
  * @returns {Promise<express.Router>} The express router.
  */
 export default async function server(config) {
   const router = express.Router(); // eslint-disable-line new-cap
   let db = null;
   let dbGet = null;
   let dbAll = null;
   let dbRun = null;
   let nistVcRestServerAddress = null;
   if (!config) {
     config = /** @type {ServerConfig} */ (JSON.parse(await readFile(
       new URL("../config.json", import.meta.url),
       {encoding: "utf8"}),
     ));
   }

   if (config.sqliteDBPath) {
    const sqliteDBPath = fileURLToPath(new URL(config.sqliteDBPath, import.meta.url))
    try {
      // Open a database connection
      db = new sqlite3.Database(sqliteDBPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          db = intitialise_demo_database(sqliteDBPath);
        } else {
          console.log('Connected to the database');
        }
      });
      dbGet = util.promisify(db.get).bind(db);
      dbAll = util.promisify(db.all).bind(db);
      dbRun = util.promisify(db.run).bind(db);
    } catch (err) {
      console.log("errO: ", err);
      throw(err);
    }
   } else {
    throw Error("Config missing sqliteDBPath")
   }

   if (config.nistVcRestServerAddress) {
    nistVcRestServerAddress = config.nistVcRestServerAddress;
   } else {
    throw Error("Config missing nistVcRestServerAddress");
   }

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

  router.post("/submit-vc/:schemaName", asyncHandler(async (req, res) => {
    const schemaName = req.params.schemaName;
    const vc = req.body;
    const vcData = JSON.stringify(vc);
    const response = await httpsPost({
      url: `${nistVcRestServerAddress}/verify/${schemaName}`,
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': vcData.length
      },
      body: vcData,
    })
    try {
      console.log("trying to parse json...")
      const claimData = JSON.parse(response.toString("utf-8"));
      switch (schemaName) {
        case 'manufacturer_trust':
          await handle_manufacturer_trust(claimData, res, dbGet, dbRun);
        case 'device_manufacturer_binding':
          res.send(`Method to handle ${schemaName} not yet implemented`);
        case 'device_trust':
          await handle_device_trust(claimData, res, dbGet, dbRun);
        case 'device_type_binding':
          await handle_device_type_binding(claimData, res, dbGet, dbRun);
        case 'device_type_vulnerability_binding':
          res.send(`Method to handle ${schemaName} not yet implemented`);
          // await handle_device_type_vulnerability_binding(claimData, res, dbGet, dbAll, dbRun);
      }
    }
    catch (err) {
      console.log(`Encountered Error: ${err}`)
      res.send(`Encountered Error: ${err}`);
    }
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