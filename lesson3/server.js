import http from "http";

import fs from "fs/promises";
import { json } from "stream/consumers";

const PORT = 3000;
const DB_PATH = "./users.json";

// foydalanuvchilarni filedan oqish
async function getUsers() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// faylga foydanuvchilarni saqlash

async function saveUsers(users) {
  await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
}

// 3. Request Body (oqim/stream) ni yig'uvchi yordamchi funksiya
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  const { url, method } = req;

  // URL parametrini ajratib olamiz (masalan: /api/users/1 -> id = 1)
  const idMatch = url.match(/^\/api\/users\/(\d+)$/);
  const userId = idMatch ? parseInt(idMatch[1]) : null;

  try {
    if (url === "/api/users" && method === "GET") {
      const users = await getUsers();
      res.statusCode = 200;
      res.end(JSON.stringify(users));
    } else if (userId && method === "GET") {
      const users = await getUsers();
      const findUser = users.find((item) => item.id === userId);

      if (!findUser) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "foydalnuvchi toplimadi" }));
      }

      res.statusCode = 200;
      res.end(JSON.stringify(findUser));
    } else if (url === "/api/users" && method === "POST") {
      const body = await getRequestBody(req);

      if (!body.name || !body.role) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: "Name va role kiritilishi shart" }),
        );
      }

      const users = await getUsers();

      const newUser = {
        id: users.length ? users[users.length - 1].id + 1 : 1,
        name: body.name,
        role: body.role,
      };

      users.push(newUser);
      await saveUsers(users);

      res.statusCode = 201;
      res.end(
        JSON.stringify({ message: "Muvaffaqiyatli yaratildi", user: newUser }),
      );

      //   update put
    } else if (userId && method === "PUT") {
      const body = await getRequestBody(req);
      const users = await getUsers();
      const index = users.findIndex((u) => u.id === userId);

      if (index === -1) {
        res.statusCode = 404;
        return req.end(
          JSON.stringify({ error: "Tahrirlash uchun foydanuvchi topilmadi" }),
        );
      }

      users[index] = {
        ...users[index],
        name: body.name || users[index].name,
        role: body.role || users[index].role,
      };

      await saveUsers(users);

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          message: "Muvaffiqaytli yangilandi",
          user: users[index],
        }),
      );

      // delete
    } else if (userId && method === "DELETE") {
      const users = await getUsers();

      const newUsers = users.filter((user) => user.id !== userId);

      if (users.length === newUsers.length) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ error: "O'chirish uchun foydalanuvchi topilmadi" }),
        );
      }

      await saveUsers(newUsers);
      res.statusCode = 200;
      res.end(JSON.stringify({ message: "Muvaffiqaytli uchirildi" }));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Sahifa yoki marshrut topilmadi" }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Serverda ichki xatolik yuz berdi" }));
  }
});

server.listen(PORT, () => {
  console.log(`server ishlamoda http://localhost:${PORT}`);
});
