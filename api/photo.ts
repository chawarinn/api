import express from "express";
import { conn , queryAsync } from "../dbconnect";


export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('SELECT photo.*, users.* FROM photo INNER JOIN users ON photo.userID = users.userID ORDER BY photo.sumscore DESC;', (err, result)=>{
      if (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
        return;
      }
      res.json(result);
    });
  });

router.delete("/:photoID", (req, res) => {
    const photoID = req.params.photoID;
    const sql = "DELETE FROM `movie` WHERE `movieID` = ?";
    conn.query(sql, [photoID], (err, result) => {
        if (err) {
            console.error("Error deleting Photo:", err);
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.status(200).json({ message: "Photo deleted successfully" });
        }
    });
});
