import express from "express";
import { router as photo} from "./api/photo";
import { router as vote} from "./api/vote";
import { router as users} from "./api/users";
import { router as login } from "./api/login";
import { router as rank} from "./api/rank";
import bodyParser from "body-parser";
import cors from "cors";

export const app = express();

app.use(
    cors({
      origin: "*",
    })
);

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/login", login);
app.use("/rank", rank);
app.use("/vote", vote);
app.use("/photo", photo);
app.use("/users", users);

