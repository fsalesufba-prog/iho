const express = require("express");
const next = require("next");

const dev = false;
const app = next({ dev, dir: "./frontend" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // rotas da API
  server.use("/api", require("./backend/dist/server"));

  // Next.js
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
  });
});
