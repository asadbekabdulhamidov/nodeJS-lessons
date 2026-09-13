import fs from "fs/promises";
const FILE_PATH = "data.json";

// read file

async function ReadFile() {
  try {
    const data = await fs.readFile(FILE_PATH, "utf-8");

    return JSON.parse(data);
  } catch (error) {
    // Agar fayl hali yo'q bo'lsa, xato bermay bo'sh massiv qaytaradi
    return [];
  }
}

// create file

async function CreateFile(newItem) {
  try {
    // eski malumotni olamz
    const list = await ReadFile();

    // yangi elementni massivga qoshamz
    list.push(newItem);

    // qayta filega yozamz

    await fs.writeFile(FILE_PATH, JSON.stringify(list, null, 2));
    console.log("Succes create or add file");
  } catch (error) {
    console.log("Saqlashda xatolik:", error);
  }
}
// 3. O'CHIRISH funksiyasi (ID bo'yicha)
async function deleteItemById(id) {
  try {
    const list = await ReadFile();

    const filteredList = list.filter((item) => item.id !== id);
    await fs.writeFile(FILE_PATH, JSON.stringify(list, null, 2));

    console.log(`ID: ${id} bo'lgan ma'lumot o'chirildi!`);
  } catch (error) {
    console.log("O'chirishda xatolik:", error);
  }
}

// Qo'shish:
await CreateFile({ id: 1, text: "Birinchi ma'lumot" });
await CreateFile({ id: 2, text: "Saloma hammaga" });

const allData = await ReadFile();

console.log(allData);

await deleteItemById(1);
