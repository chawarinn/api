import express from "express";
import { conn } from "../dbconnect";
import { Vote } from "../model/user";
import mysql from "mysql";
export const router = express.Router();



  router.get("/", (req, res) => {
    conn.query('select * from votes', (err, result, fields)=>{
      res.json(result);
    });
  });
  
  router.get("/score/:id", (req, res) => {
    const photoID = req.params.id;
    let sql = "SELECT SUM(votes.score) AS total_score FROM votes JOIN photo ON photo.photoID = votes.photoID WHERE votes.photoID = ?";
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
  let sql ="INSERT INTO `votes`( `photoID`, `date_time`, `score`, `checkvote`) VALUES (?,CURRENT_TIME(),?,?)";
    
  sql = mysql.format(sql, [   
   vote.photoID,
   vote.score,
   1
  ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;

      let photoID = vote.photoID;
      let totalScoreSql = "SELECT SUM(votes.score) AS total_score FROM votes JOIN photo ON photo.photoID = votes.photoID WHERE votes.photoID = ?";
      totalScoreSql = mysql.format(totalScoreSql, [photoID]);
      conn.query(totalScoreSql, (err, result) => {
        if (err) throw err;
        const totalScore = result[0].total_score;

        let updateSql = "UPDATE photo SET sumscore = ? WHERE photoID = ?";
        updateSql = mysql.format(updateSql, [totalScore, photoID]);
        conn.query(updateSql, (updateErr, updateResult) => {
          if (updateErr) throw updateErr;
          res.status(201).json({
            affected_row: result.affectedRows,
            last_idx: result.insertId,
            updated_score: totalScore
          });
        });
      });
    });
  });
  

router.post("/lose", (req, res) => {
  let vote = req.body;
  let sql = "INSERT INTO `votes`( `photoID`, `date_time`, `score`, `checkvote`) VALUES (?,CURRENT_TIME(),?,?)";

  sql = mysql.format(sql, [
    vote.photoID,
    vote.score,
    0
  ]);
  conn.query(sql, (err, result) => {
    if (err) throw err;

    let photoID = vote.photoID;
    let totalScoreSql = "SELECT SUM(votes.score) AS total_score FROM votes JOIN photo ON photo.photoID = votes.photoID WHERE votes.photoID = ?";
    totalScoreSql = mysql.format(totalScoreSql, [photoID]);
    conn.query(totalScoreSql, (err, result) => {
      if (err) throw err;
      const totalScore = result[0].total_score;

      let updateSql = "UPDATE photo SET sumscore = ? WHERE photoID = ?";
      updateSql = mysql.format(updateSql, [totalScore, photoID]);
      conn.query(updateSql, (updateErr, updateResult) => {
        if (updateErr) throw updateErr;
        res.status(201).json({
          affected_row: result.affectedRows,
          last_idx: result.insertId,
          updated_score: totalScore
        });
      });
    });
  });
});
