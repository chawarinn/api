import mysql from "mysql";
import express from "express";
import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { conn, queryAsync  } from "../dbconnect";
import { User } from "../model/user";
import multer from "multer";

const firebaseConfig = {
  apiKey: "AIzaSyCOBbSH5eIGRAqRlmuUk0PZFFVz8lPZXlM",
  authDomain: "playlist-award-918c1.firebaseapp.com",
  projectId: "playlist-award-918c1",
  storageBucket: "playlist-award-918c1.appspot.com",
  messagingSenderId: "384384394361",
  appId: "1:384384394361:web:1eec6d7120e6a2e03ce0a8",
  measurementId: "G-0B0CC84WEB"
};

initializeApp(firebaseConfig);
const storage = getStorage();

class FileMiddleware {
  filename = "";
  public readonly diskLoader = multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

export const router = express.Router();
const bodyParser = require('body-parser');
const fileUpload = new FileMiddleware();

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
  router.put("/update/:userID", fileUpload.diskLoader.single("file"), async (req, res) => {
    const userID = req.params.userID;
    
    const filename = Math.round(Math.random() * 10000) + ".png";
    const storageRef = ref(storage, "/images/" + filename);    
    const metaData = { contentType: req.file!.mimetype };
    const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metaData)
    const url = await getDownloadURL(snapshot.ref);
  
    let sql = "UPDATE users SET avatar = ? WHERE userID = ?";
    sql = mysql.format(sql, [
      url, // สลับตำแหน่งของ url กับ userID
      userID // สลับตำแหน่งของ userID กับ url
    ]);
    console.log(sql);
    conn.query(sql, (err, result) => {
      if (err) {
        console.error('Error updating avatar:', err);
        return res.status(500).json({ error: 'Error updating avatar' });
      }
      res.status(200).json({ message: 'Avatar updated successfully' });
    });
  });
  
router.put("/edit/:userID", async (req, res) => {
  try {
    let id = +req.params.userID;
    let user: User = req.body;

    let sql = mysql.format("SELECT * FROM users WHERE userID = ?", [id]);
    let result = await queryAsync(sql);
    const jsonStr = JSON.stringify(result);
      const jsonObj = JSON.parse(jsonStr);
      const userOriginal : User = jsonObj[0];

    // รวมข้อมูลใหม่และข้อมูลเดิม
    const updateUser = { ...userOriginal, ...user };

    // ตรวจสอบและอัปเดตข้อมูลเฉพาะที่มีการส่งมาจากผู้ใช้
    let updateFields = [];
    let updateValues = [];

    if (user.username) {
      updateFields.push('username');
      updateValues.push(updateUser.username);
    }
    if (user.avatar) {
      updateFields.push('avatar');
      updateValues.push(updateUser.avatar);
    }
    if (user.email) {
      updateFields.push('email');
      updateValues.push(updateUser.email);
    }
    if (user.password) {
      updateFields.push('password');
      updateValues.push(updateUser.password);
    }

    // อัปเดตฐานข้อมูล
    if (updateFields.length > 0) {
      sql = `UPDATE users SET ${updateFields.map(field => `${field} = ?`).join(', ')} WHERE userID = ?`;
      updateValues.push(id);
      sql = mysql.format(sql, updateValues);

      conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).json({ affected_row: result.affectedRows });
      });
    } else {
      res.status(400).json({ error: "No fields to update" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
