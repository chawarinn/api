import express from "express";
import { conn, queryAsync } from "../dbconnect";
import mysql from "mysql";
import { User } from "../model/user";

export const router = express.Router();
const bodyParser = require('body-parser');

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

// router.put("/edit/:userID",  (req, res) => {

//   let id = +req.params.userID;
//   let user: User = req.body;

//   let sql = mysql.format("select * from users where userID = ?", [id]);
//   let result =  queryAsync(sql);
//   const jsonStr = JSON.stringify(result);
//   const jsonObj = JSON.parse(jsonStr);
//   const userOriginal : User = jsonObj[0];

//   // รวมข้อมูลใหม่และข้อมูลเดิม
//   const updateUser = {...userOriginal, ...user}; 

//   // ตรวจสอบและอัปเดตข้อมูลเฉพาะที่มีการส่งมาจากผู้ใช้
//   let updateFields = [];
//   let updateValues = [];
  
//   if (user.username) {
//     updateFields.push('username');
//     updateValues.push(updateUser.username);
//   }
//   if (user.email) {
//     updateFields.push('email');
//     updateValues.push(updateUser.email);
//   }
//   if (user.password) {
//     updateFields.push('password');
//     updateValues.push(updateUser.password);
//   }

//   // อัปเดตฐานข้อมูล
//   if (updateFields.length > 0) {
//     sql = `UPDATE users SET ${updateFields.map(field => `${field} = ?`).join(', ')} WHERE userID = ?`;
//     updateValues.push(id);
//     sql = mysql.format(sql, updateValues);
    
//     conn.query(sql, (err, result) => {
//       if (err) throw err;
//       res.status(201).json({ affected_row: result.affectedRows });
//     });
//   } else {
//     res.status(400).json({ error: "No fields to update" });
//   }
// });
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

