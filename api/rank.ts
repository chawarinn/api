import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";

export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('SELECT * FROM rankUpdate', (err, result)=>{
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
      res.json(result);
    });
});
router.get("/day", (req, res) => {
  conn.query('SELECT * FROM rankUpdate WHERE date = (SELECT MAX(date) FROM rankUpdate)', (err, result)=>{
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.json(result);
  });
});
router.get("/:id", (req, res) => {
    
  const photoID = req.params.id;

  let sql = "select * from rankUpdate Where photoID = ? ORDER BY rankID DESC LIMIT 7";
  sql = mysql.format(sql, [
      photoID
  ]);
  conn.query(sql, (err,result)=>{
      if(err) throw err;
      else {
        res.json(result);
      }
  });
});
router.get("/grahp/:id", (req, res) => {
  const photoID = req.params.id;

  let sql = "SELECT *, DATE_FORMAT(date, '%d-%m-%Y') AS formatted_date "+
  "FROM rankUpdate "+
  "WHERE photoID = ? "+
  "ORDER BY rankID "+
  "LIMIT 7;";
  sql = mysql.format(sql, [
      photoID
  ]);
  conn.query(sql, (err,result)=>{
      if(err) throw err;
      else {
        res.json(result);
      }
  });
});

router.get("/nowRank", (req, res) => {

  let sql = "SELECT photoID, SUM(score) AS total_score, "+ 
  "FIND_IN_SET(photoID, ( "+ 
  "SELECT GROUP_CONCAT(photoID ORDER BY total_score DESC) "+ 
  "FROM (SELECT photoID, SUM(score) AS total_score FROM vote GROUP BY photoID) AS scores "+ 
  ")) AS `rank` "+ 
  "FROM vote "+ 
  "GROUP BY photoID "+ 
  "ORDER BY total_score DESC;";
  conn.query(sql, (err,result)=>{
      if(err) throw err;
      else {
        res.json(result);
      }
  });
});
