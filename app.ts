import express from "express";
import { router as main } from "./api/main";
import { router as photo} from "./api/photo";
import { router as vote} from "./api/vote";
import { router as users} from "./api/users";
import { router as login } from "./api/login";
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
app.use("/", main);
app.use("/login", login);
app.use("/main", main);
app.use("/vote", vote);
app.use("/photo", photo);
app.use("/users", users);

