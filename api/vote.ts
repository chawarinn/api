import express from "express";
import { conn } from "../dbconnect";
import { Vote } from "../model/user";
import mysql from "mysql";
export const router = express.Router();



  router.get("/", (req, res) => {
    conn.query('select * from vote', (err, result, fields)=>{
      res.json(result);
    });
  });
  
  router.get("/score/:id", (req, res) => {
    const photoID = req.params.id;
    let sql = "SELECT SUM(vote.score) AS total_score FROM vote JOIN photo ON photo.photoID = vote.photoID WHERE vote.photoID = ?";
    sql = mysql.format(sql, [
      photoID
    ]);
    conn.query(sql, (err,result)=>{
        if (err) {
            res.status(400).json(err);
        } else {
            res.json(result);
        }
    });
  });

  router.post("/win", (req, res) => {
    let vote : Vote = req.body;
    let sql ="INSERT INTO `vote`( `photoID`, `date_time`, `score`, `checkvote`) VALUES (?,CURRENT_TIME(),?,?)";
      
    sql = mysql.format(sql, [   
     vote.photoID,
     vote.score,
     1
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });

  router.post("/lose", (req, res) => {
    let vote : Vote = req.body;
    let sql ="INSERT INTO `vote`( `photoID`, `date_time`, `score`, `checkvote`) VALUES (?,CURRENT_TIME(),?,?)";
      
    sql = mysql.format(sql, [   
     vote.photoID,
     vote.score,
     0
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });
