import express from "express";
import { conn } from "../dbconnect";
import mysql from "mysql";
import { User } from "../model/user";

export const router = express.Router();

// router.get("/", (req, res) => {
//   conn.query('select * from users', (err, result, fields)=>{
//     if (err) {
//       console.error(err);
//       res.status(500).json({ message: "Internal server error" });
//       return;
//     }
//     res.json(result);
//   });
// });

router.get("/:id", (req, res) => {
  let id = +req.params.id;
  conn.query("select * from users where userID = ?", [id], (err, result, fields) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
    res.json(result);
  });
});


router.get("/", (req, res) => {
  const { email, password } = req.query;

  conn.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, result, fields) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
      return;
    }

    if (result.length > 0) {
      const userID = result[0].userID;
      const userType = result[0].type; // สมมติว่ามีค่า type ในฟิลด์ข้อมูลของผู้ใช้

      if (userType === 1) {
        res.status(200).json({ userID: userID, type: userType }); // ส่งข้อมูล userID และ type กลับไปให้ Angular
      } else if (userType === 2) {
        res.status(200).json({ userID: userID, type: userType }); // ส่งข้อมูล userID และ type กลับไปให้ Angular
      } else {
        res.status(401).json({ message: "Invalid user type" }); // ค่า type ไม่ถูกต้อง
      }
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

  // POST /trip + Data แบบ json
router.post("/", (req, res) => {
  let user : User  = req.body; 
  let sql = "INSERT INTO `users`(`username`, `type`, `avatar`, `email`, `password`) VALUES (?,?,?,?,?)";
  sql = mysql.format(sql, [
    user.username,
    1,
    1,
    user.email,
    user.password
  ]);
  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error inserting user:", err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(201).json({ insertId: result.insertId });
    }
  });
});




