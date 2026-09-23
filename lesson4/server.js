import http from "http";
import fs from "fs/promises";

const PORT = 3000;
const DB_PATH = "./todos.json";

// 1. JSON faylini o'qish
async function getTodos() {
  try {
    const todos = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(todos);
  } catch (error) {
    return [];
  }
}

// 2. Faylga saqlash
async function savedTodos(todos) {
  await fs.writeFile(DB_PATH, JSON.stringify(todos, null, 2));
}

// 3. Request body (oqim/stream) ma'lumotini yig'uvchi funksiya
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

// Server yaratish
const server = http.createServer(async (req, res) => {
  const { url, method } = req;

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const idMatch = url.match(/^\/api\/todos\/(\d+)$/);
  const todoId = idMatch ? parseInt(idMatch[1]) : null;
  try {
    // ---------------- GET /api/todos ----------------
    if (url === "/api/todos" && method === "GET") {
      const todos = await getTodos();
      res.statusCode = 200;
      res.end(JSON.stringify(todos));

      // ---------------- POST /api/todos ----------------
    } else if (todoId && method === "GET") {
      const todos = await getTodos();
      const findTodo = todos.find((t) => t.id === todoId);

      if (!findTodo) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "bunday todo yoq" }));
      }

      res.statusCode = 200;
      res.end(JSON.stringify(findTodo));
    } else if (url === "/api/todos" && method === "POST") {
      // Slash (/) qo'shildi!
      const body = await getRequestBody(req); // await qo'shildi!

      if (!body.title) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Title kiritilishi shart" }));
      }

      const todos = await getTodos();

      const newTodo = {
        id: todos.length ? todos.at(-1).id + 1 : 1,
        title: body.title,
        isCompleted: false,
      };

      todos.push(newTodo);
      await savedTodos(todos);

      res.statusCode = 201; // Created
      res.end(
        JSON.stringify({
          message: "yaratildi",
          todo: newTodo,
        }),
      );

      // ---------------- 404 NOT FOUND ----------------
    } else if (todoId && method === "PUT") {
      const body = await getRequestBody(req);
      const todos = await getTodos();
      const index = todos.findIndex((t) => t.id === todoId);

      if (index === -1) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ error: " Tahrirlash uchun Bunday todo topilmadi" }),
        );
      }

      todos[index] = {
        ...todos[index],
        title: body.title !== undefined ? body.title : todos[index].title,
        isCompleted:
          body.isCompleted !== undefined
            ? body.isCompleted
            : todos[index].isCompleted,
      };

      await savedTodos(todos);

      res.statusCode = 200;
      res.end(JSON.stringify({ message: "yanglandi", todo: todos[index] }));
    } else if (todoId && method === "DELETE") {
      const todos = await getTodos();

      const newTodos = todos.filter((t) => t.id !== todoId);

      if (todos.length === newTodos.length) {
        res.statusCode = 404;
        res.end(
          JSON.stringify({ error: "Ochirish uchun bunday todo topilmadi" }),
        );
      }
      await savedTodos(newTodos);

      res.statusCode = 200;
      res.end(
        JSON.stringify({ message: `${todoId} id ga ega todo ochirildi` }),
      );
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Marshrut topilmadi" }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Serverda ichki xatolik" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server ishlamoqda: http://localhost:${PORT}`);
});
