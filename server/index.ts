import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ttsMiddleware } from "./ttsPlugin.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");
const port = Number(process.env.PORT) || 4173;

const app = express();

app.use(ttsMiddleware());
app.use(express.static(distDir, { index: false }));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    next();
    return;
  }
  res.sendFile(path.join(distDir, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.listen(port, () => {
  console.log(`Voice An Nhiên đang chạy tại http://localhost:${port}`);
});
