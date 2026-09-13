import fs from "fs/promises";

const FILE_PATH = "books.json";

async function getBooks() {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    // console.log("Malumot olishda Xatolik: ", error);
    return [];
  }
}

async function addBook(newBook) {
  try {
    const booksList = await getBooks();

    let findBook = booksList.find((book) => book.id === newBook.id);

    if (findBook) {
      console.log(`ID: ${newBook.id} bo'lgan kitob allaqachon mavjud!`);
      return; // Agar kitob bo'lsa, saqlamay funksiyadan chiqib ketadi
    }
    booksList.push(newBook);

    await fs.writeFile(FILE_PATH, JSON.stringify(booksList, null, 2));
    console.log("Muvaffaqilaytli qoshildi");
  } catch (error) {
    console.log("Saqlashda xatolik:", error);
  }
}

// await addBook({ id: 1, title: "Oʻtkan kunlar", author: "Abdulla Qodiriy" });
// await addBook({ id: 1, title: "Oʻtkan kunlar", author: "Abdulla Qodiriy" });
// await addBook({ id: 2, title: "Dunyoning ishlari", author: "Oʻtkir Hoshimov" });

const allBooks = await getBooks();
console.log(allBooks);
