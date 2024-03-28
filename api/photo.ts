import express from "express";
import { conn , queryAsync } from "../dbconnect";
import multer from "multer";
import mysql from "mysql";

export const router = express.Router();

import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCOBbSH5eIGRAqRlmuUk0PZFFVz8lPZXlM",
  authDomain: "playlist-award-918c1.firebaseapp.com",
  projectId: "playlist-award-918c1",
  storageBucket: "playlist-award-918c1.appspot.com",
  messagingSenderId: "384384394361",
  appId: "1:384384394361:web:1eec6d7120e6a2e03ce0a8",
  measurementId: "G-0B0CC84WEB"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const storage = getStorage();

router.get("/", (req, res) => {
  conn.query('SELECT  photo.*, users.*  FROM photo INNER JOIN users ON photo.userID = users.userID ORDER BY photo.sumscore DESC', (err, result)=>{
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.json(result);
  });
});

class FileMiddleware {
  filename = "";
  public readonly diskLoader = multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

const fileUpload = new FileMiddleware();

router.post("/:id", fileUpload.diskLoader.single("file"), async (req, res) => {
    const userID = req.params.id;

    const filename = Math.round(Math.random() * 10000) + ".png";
    const storageRef = ref(storage,"/images/"+filename);    
    const metaData = { contentType : req.file!.mimetype };
    const snapshot = await uploadBytesResumable(storageRef,req.file!.buffer,metaData)
    const url = await getDownloadURL(snapshot.ref);

    let sql = "INSERT INTO photo (userID, photo_url) VALUES (?,?)";
    sql = mysql.format(sql, [
      userID,
      url
    ]);

  conn.query(sql, (err, result) => {
    if (err) {
      console.error('Error inserting photo into database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    const photoID = result.insertId;

    let voteSql = `INSERT INTO votes (photoID, score, date_time, checkvote) VALUES (?, ?, CURRENT_TIME(), ?)`;
    voteSql = mysql.format(voteSql, [photoID, 1000, 2]);

    conn.query(voteSql, (voteErr, voteResult) => {
      if (voteErr) {
        console.error('Error inserting vote into database:', voteErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      res.status(201).json({ 
        affected_row: voteResult.affectedRows, 
        last_idx: photoID 
      });
    });
  });
});


router.put("/name/:id", (req, res) => {
  const photoID = req.params.id;
  const newName = req.body.name_playlist;

  const sql = 'UPDATE photo SET name_playlist = ? WHERE photoID = ?';
  conn.query(sql, [newName, photoID], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.json({ message: "Playlist name updated successfully." });
  });
});


router.delete("/delete/:id", async (req, res) => {
  const photoID = req.params.id;

  try {
      // ค้นหา URL ของรูปภาพ
      let selectQuery = "SELECT photo_url FROM photo WHERE photoID = ?";
      selectQuery = mysql.format(selectQuery, [photoID]);

      conn.query(selectQuery, async (err, result) => {
          if (err) {
              return res.status(400).json(err);
          }

          const imagePath = result[0].photo_url;

          // ลบรูปภาพจาก storage
          const storageRef = ref(storage, imagePath);
          try {
              await deleteObject(storageRef);
              console.log('Image deleted successfully');
          } catch (error) {
              return res.status(501).json({ error: 'Error deleting image from storage' });
          }

          let deleteVotesQuery = "DELETE FROM votes WHERE photoID = ?";
          deleteVotesQuery = mysql.format(deleteVotesQuery, [photoID]);
          
          try {
              await conn.query(deleteVotesQuery);
              console.log('Votes deleted successfully');
          
              let deleteQuery = "DELETE FROM photo WHERE photoID = ?";
              deleteQuery = mysql.format(deleteQuery, [photoID]);
          
              conn.query(deleteQuery, (err, result) => {
                  if (err) {
                      console.error('Error deleting photo:', err);
                      return res.status(500).json({ error: 'Error deleting photo' });
                  }
                  res.status(200).json({ message: 'Photo and related votes deleted successfully' });
              });
          } catch (error) {
              console.error('Error deleting votes:', error);
              return res.status(500).json({ error: 'Error deleting votes' });
          }
      });
  } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


router.put("/update/:photoID/:userID", fileUpload.diskLoader.single("file"), async (req, res) => {
  const photoID = req.params.photoID;
  const userID = req.params.userID;
  
  const filename = Math.round(Math.random() * 10000) + ".png";
  const storageRef = ref(storage, "/images/" + filename);    
  const metaData = { contentType: req.file!.mimetype };
  const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metaData)
  const url = await getDownloadURL(snapshot.ref);

  let sql = "UPDATE photo SET userID = ?, photo_url = ? WHERE photoID = ?";
  sql = mysql.format(sql, [
    userID,
    url,
    photoID
  ]);
  console.log(sql);
  conn.query(sql, (err, result) => {
  });
});


router.get("/score/:id", (req, res) => {
  const photoID = req.params.id;

  let sql = "SELECT sumscore AS score FROM photo WHERE photoID = ? ORDER BY photoID DESC LIMIT 1";
  sql = mysql.format(sql, [
    photoID
  ]);

  conn.query(sql, (err,result)=>{
      if(err) throw err;
      else {
          res.json(result[0]);
      }
  });
});
//เทียบกับtable users ถ้าuserIDไหนไม่มีในtable photo แต่มีในtable users ให้แทนค่าส่งคืนมาเป็น0
router.get("/count", (req, res) => {
  conn.query('SELECT u.userID, COALESCE(COUNT(p.userID), 0) AS userCount FROM users u LEFT JOIN photo p ON u.userID = p.userID GROUP BY u.userID', (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.json(result);
  });
});


router.get("/rank/latest", (req, res) => {
  conn.query('SELECT * FROM rankUpdate WHERE date = (SELECT MAX(date) FROM rankUpdate)', (err, result)=>{
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.json(result);
  });
});