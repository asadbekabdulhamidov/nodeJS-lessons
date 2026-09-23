import http from "http";

const PORT = 3000;

// Serverni yaratamiz
const server = http.createServer((req, res) => {
  let { url, method } = req;

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (url === "/" && method === "GET") {
    res.statusCode = "200";
    res.end(JSON.stringify({ message: "bosh sahifaga hush kelibsz " }));
  } else if (url === "/api/users" && method === "GET") {
    res.statusCode = 200;

    const users = [
      {
        id: 1,
        name: "Asadbek",
      },
      {
        id: 2,
        name: "Doston",
      },
    ];
    res.end(JSON.stringify(users, null, 2));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Bunday sahifa topilmadi" }));
  }
});

// Serverni ma'lum bir portda eshitishga (tinglashga) qo'yamiz
server.listen(PORT, () => {
  console.log(`Server ishlamoqda: http://localhost:${PORT}`);
});
