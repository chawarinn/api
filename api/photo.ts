import express from "express";
import { conn , queryAsync } from "../dbconnect";
import multer from "multer";
import mysql from "mysql";

export const router = express.Router();
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

router.get("/", (req, res) => {
    conn.query('SELECT rankUpdate.*, photo.*, users.*  FROM rankUpdate INNER JOIN photo ON rankUpdate.photoID = photo.photoID INNER JOIN users ON photo.userID = users.userID ORDER BY rankUpdate.score DESC', (err, result)=>{
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

    let sql = "INSERT INTO `photo`(`userID`, `photo_url`) VALUES (?,?)";
    sql = mysql.format(sql, [
      userID,
        url
    ]);
    conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).json({
            affected_row: result.affectedRows, 
            last_idx: result.insertId
        });
    });
});

