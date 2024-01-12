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
  * @param {string} [voltConfigPath] - The path to the TDX Volt Configuration file.
  * By default, this is the `../volt-config.json` file.
  * @returns {Promise<express.Router>} The express router.
  */
 export default async function server(config, voltConfigPath = fileURLToPath(
   new URL("../volt-config.json", import.meta.url),
 )) {
   const router = express.Router(); // eslint-disable-line new-cap
   let db = null;
   let dbGet = null;
   let dbRun = null;
   if (!config) {
     config = /** @type {ServerConfig} */ (JSON.parse(await readFile(
       new URL("../config.json", import.meta.url),
       {encoding: "utf8"}),
     ));
   }

   if (config.voltConfigPath) {
    voltConfigPath = fileURLToPath(new URL(config.voltConfigPath, import.meta.url))
   }

   if (config.sqliteDBPath) {
    const sqliteDBPath = fileURLToPath(new URL(config.sqliteDBPath, import.meta.url))
    // Open a database connection
    db = new sqlite3.Database(sqliteDBPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Connected to the database');
      }
    });
    dbGet = util.promisify(db.get).bind(db);
    dbRun = util.promisify(db.run).bind(db);
   } else {
    throw Error("Config missing sqliteDBPath")
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
      url: `http://localhost:3000/verify/${schemaName}`,
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': vcData.length
      },
      body: vcData,
    })
    try {
      console.log("trying to parse json...")
      const claimData = JSON.parse(response.toString("utf-8"));
      // const vcJSON = JSON.parse(vcData);
      // const issuanceDate = vcJSON.issuanceDate
      switch (schemaName) {
        case 'manufacturer_trust':
          const {user, manufacturer, trust, issuanceDate} = claimData;
          let manufacturerId = null;
          console.log(`manufacturer: ${manufacturer}`)
          const manufacturerRow = await dbGet("SELECT id from manufacturer where id = ? OR name = ?", [manufacturer, manufacturer])
          if (!manufacturerRow) {
            console.log(`No manufacturer found for ID or name: ${manufacturer}`);
          } else {
            manufacturerId = manufacturerRow.id;
          }
          let userId = null;
          const userRow = await dbGet("SELECT id from user where id = ? OR username = ?", [user, user])
          if (!userRow) {
            console.log(`No user found for ID or name: ${user}`);
          } else {
            userId = userRow.id;
          }
          if (!manufacturerId) {
            res.send(`No manufacturer with id or name ${manufacturer}`)
          } else if (!userId) {
            res.send(`No user with id or name ${user}`)
          } else {
            const trustRow = await dbGet("SELECT * from trusts WHERE user_id = ? AND manufacturer_id = ?", [userId, manufacturerId])
            if (trust) {
              if (!trustRow) {
                await dbRun("INSERT INTO trusts (user_id, manufacturer_id, created_at) VALUES (?, ?, ?)",
                  [userId, manufacturerId, issuanceDate]);
                res.send(`Trusted added to manufacturer ${manufacturer} by user ${user}`)
              } else {
                res.send(`Manufacturer ${manufacturer} is already trusted by user ${user}`)
              }
            } else {
              if (!trustRow) {
                res.send(`Manufacturer ${manufacturer} is not trusted by user ${user}`)
              } else {
                await dbRun("DELETE FROM trusts WHERE user_id = ? AND manufacturer_id = ?", [userId, manufacturerId]);
                res.send(`Trusted removed from manufacturer ${manufacturer} by user ${user}`)
              }
            }
          }
        case 'device_manufacturer_binding':
          console.log();
        case 'device_trust':
          null
        case 'device_type_binding':
          null
        case 'device_type_vulnerable':
          null
      }
    }
    catch (err) {
      console.log(`got error: ${err} responding`)
      res.send(response);
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