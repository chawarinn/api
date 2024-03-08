import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";

export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('select * from users', (err, result)=>{
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
      res.json(result);
    });
  });
  