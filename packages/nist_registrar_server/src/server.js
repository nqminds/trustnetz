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
import fs from "fs";

// Read the schema from the file
const schemaPath = 'schema.sql';
const schema = fs.readFileSync(schemaPath, 'utf8');

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
          console.log("Database file missing, initialising database file with schema")
          db = new sqlite3.Database(sqliteDBPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
          // Execute the schema
          db.serialize(function() {
            db.exec(schema, function (err) {
              if (err) {
                console.error(err.message);
              } else {
                console.log('Schema executed successfully');
              }
            });
            // List of usernames
            const usernames = ['Ash', 'John', 'Ant', 'James', 'Ionut', 'Nick', 'Anita', 'Hannah', 'Suzanne', 'Alois', 'Alex', 'Toby'];
  
            // Insert data into user table with UUID for each user
            for (const username of usernames) {
              db.run("INSERT INTO user (id, username, created_at) VALUES (?, ?, ?)", [uuidv4(), username, new Date().toISOString()]);
            }
  
            // Update users 'Nick' and 'John' to have can_issue_purchase_rights and can_issue_connection_rights
            db.run("UPDATE user SET can_issue_purchase_rights = TRUE, can_issue_connection_rights = TRUE WHERE username IN ('Nick', 'John')");
  
            // Update users to have can_issue_trust
            db.run("UPDATE user SET can_issue_trust = TRUE WHERE username IN ('Nick', 'Ash', 'Ant', 'James', 'Ionut')");
  
            // Insert data into trusts table - Nick Trusts Amazon
            const nickRow = db.get("SELECT id FROM user WHERE username = 'Nick'");
            const nicksId = nickRow.id;
  
            // Insert data into allow_to_connect - John allows Ash's Amazon Echo to connect
            const johnRow = db.get("SELECT id FROM user WHERE username = 'John'");
            const johnsId = johnRow.id;
  
            // Insert a single entry into gives_purchase_rights
            const ashRow = db.get("SELECT id FROM user WHERE username = 'Ash'");
            const ashsId = ashRow.id;
  
            const nickRowForRights = db.get("SELECT id FROM user WHERE username = 'Nick'");
            const nicksIdForRights = nickRowForRights.id;
  
            db.run("INSERT INTO gives_purchase_rights (recipient_id, authoriser_id, created_at) VALUES (?, ?, ?)", [ashsId, nicksIdForRights, new Date().toISOString()]);
          });
        } else {
          console.log('Connected to the database');
        }
      });
      dbGet = util.promisify(db.get).bind(db);
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
      // const vcJSON = JSON.parse(vcData);
      // const issuanceDate = vcJSON.issuanceDate
      switch (schemaName) {
        case 'manufacturer_trust':
          const {user, manufacturer, trust, issuanceDate} = claimData;
          let manufacturerId = null;
          console.log(`manufacturer: ${manufacturer}`)
          const manufacturerRow = dbGet("SELECT id from manufacturer where id = ? OR name = ?", [manufacturer, manufacturer])
          if (!manufacturerRow) {
            console.log(`No manufacturer found for ID or name: ${manufacturer}`);
          } else {
            manufacturerId = manufacturerRow.id;
          }
          let userId = null;
          const userRow = dbGet("SELECT id from user where id = ? OR username = ?", [user, user])
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
            const trustRow = dbGet("SELECT * from trusts WHERE user_id = ? AND manufacturer_id = ?", [userId, manufacturerId])
            if (trust) {
              if (!trustRow) {
                dbRun("INSERT INTO trusts (user_id, manufacturer_id, created_at) VALUES (?, ?, ?)",
                  [userId, manufacturerId, issuanceDate]);
                res.send(`Trusted added to manufacturer ${manufacturer} by user ${user}`)
              } else {
                res.send(`Manufacturer ${manufacturer} is already trusted by user ${user}`)
              }
            } else {
              if (!trustRow) {
                res.send(`Manufacturer ${manufacturer} is not trusted by user ${user}`)
              } else {
                dbRun("DELETE FROM trusts WHERE user_id = ? AND manufacturer_id = ?", [userId, manufacturerId]);
                res.send(`Trust removed from manufacturer ${manufacturer} by user ${user}`)
              }
            }
          }
        case 'device_manufacturer_binding':
          null
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