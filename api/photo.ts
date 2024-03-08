import express from "express";
import { conn , queryAsync } from "../dbconnect";
import mysql from "mysql";
import { Photo } from "../model/user";


export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('SELECT * FROM photo ORDER BY sumscore DESC;', (err, result)=>{
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
      res.json(result);
    });
  });


//   router.put("/:photoID", async (req, res) => {
//     //receive data
//            let  id = req.params.photoID;
//            let sumscore : Photo = req.body;
           
//     //        //Get Original data
//             let sql =mysql.format( "select * from photo where photoID = ?",[id]);
//             let result = await queryAsync(sql);
//             const jsonStr = JSON.stringify(result);
//             const jsonOBj = JSON.parse(jsonStr);
//             const sumscoreOriginal : Photo = jsonOBj[0];
            
          
//            const updatesumscore = {...sumscoreOriginal, ...sumscore};
  
    
//            sql =
//            "update  photo set sumscore`=? where photoID`=?";
//          sql = mysql.format(sql, [
//           updatesumscore.sumscore,
//           id
//          ]);
//          conn.query(sql, (err, result) => {
//            if (err) throw err;
//            res.status(201).json({ affected_row: result.affectedRows });
//          });
//      });

