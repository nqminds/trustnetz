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

import intitialiseDemoDatabase from "./initialise_demo_database.js";
import handleDeviceTrust from "./handle_device_trust.js"
import handleManufacturerTrust from "./handle_manufacturer_trust.js";
import handleDeviceTypeBinding from "./handle_device_type_binding.js";
import handleDeviceTypeVulnerable from "./handle_device_type_vulnerable.js";
import storeClaimAndResponse from "./store_claim_and_response.js";
import getManufacturerInfo from "./get_manufacturer_info.js";
import getDeviceTypeInfo from "./get_device_type_info.js";
import getDeviceInfo from "./get_device_info.js";

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

 function connectToDatabase(sqliteDBPath) {
  return new Promise((resolve, reject) => {
    let db = null;
    try {
      db = new sqlite3.Database(sqliteDBPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          db = intitialiseDemoDatabase(sqliteDBPath);
          resolve(db)
        } else {
          console.log('Connected to the database');
          resolve(db)
        }
      });
    } catch (err) {
      reject(err);
    }
  })
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
      db = await connectToDatabase(sqliteDBPath);
      dbGet = util.promisify(db.get).bind(db);
      dbAll = util.promisify(db.all).bind(db);
      dbRun = util.promisify(db.run).bind(db);
    } catch (err) {
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
    console.log("received vc");
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
      const claimData = JSON.parse(response.toString("utf-8"));
      let handlerResponse = `Method to handle ${schemaName} not yet implemented`;
      switch (schemaName) {
        case 'manufacturer_trust':
          handlerResponse = await handleManufacturerTrust(claimData, dbGet, dbRun);
          break;
        case 'device_manufacturer_binding':
          handlerResponse = handlerResponse;
          break;
        case 'device_trust':
          handlerResponse = await handleDeviceTrust(claimData, dbGet, dbRun);
          break;
        case 'device_type_binding':
          handlerResponse = await handleDeviceTypeBinding(claimData, dbGet, dbRun);
          break;
        case 'device_type_vulnerable':
          handlerResponse = await handleDeviceTypeVulnerable(claimData, dbGet, dbRun);
          break;
      }
      await storeClaimAndResponse(claimData, handlerResponse, dbGet, dbRun);
      res.send({response: handlerResponse});
    }
    catch (err) {
      res.send(`Encountered Error: ${err}`);
    }
  }));

  router.get("/manufacturers", asyncHandler(async (req, res) => {
    try {
      const manufacturers = await dbAll("SELECT * from manufacturer");
      res.send(manufacturers);
    }
    catch (err) {
      res.send(`Encountered Error: ${err}`);
    }
  }));

  router.get("/devices", asyncHandler(async (req, res) => {
    try {
      const devices = await dbAll("SELECT * from device");
      res.send(devices);
    }
    catch (err) {
      res.send(`Encountered Error: ${err}`);
    }
  }));

  router.get("/device-types", asyncHandler(async (req, res) => {
    try {
      const devicesTypes = await dbAll("SELECT * from device_type");
      res.send(devicesTypes);
    }
    catch (err) {
      res.send(`Encountered Error: ${err}`);
    }
  }));

  router.get("/vc-logs", asyncHandler(async (req, res) => {
    try {
      let logs = null;
      try {
        logs = await dbAll("SELECT * from vc_log");
      } catch (err) {
        logs = [];
      }
      res.send(logs);
    }
    catch (err) {
      res.send(`Encountered Error: ${err}`);
    }
  }));

  router.get("/info/manufacturer/:manufacturer", asyncHandler(async (req, res) => {
    try {
      const manufacturer = decodeURIComponent(req.params.manufacturer);
      const response = await getManufacturerInfo(manufacturer, dbGet);
      res.send(response);
    }
    catch (err) {
      res.send(`Encountered Error: ${err}`);
    }
  }));

  router.get("/info/device-type/:deviceType", asyncHandler(async (req, res) => {
    try {
      const deviceType = decodeURIComponent(req.params.deviceType);
      const response = await getDeviceTypeInfo(deviceType, dbGet);
      res.send(response);
    }
    catch (err) {
      res.send(`Encountered Error: ${err}`);
    }
  }));

  router.get("/info/device/:device", asyncHandler(async (req, res) => {
    try {
      const device = decodeURIComponent(req.params.device);
      const response = await getDeviceInfo(device, dbGet);
      res.send(response);
    }
    catch (err) {
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