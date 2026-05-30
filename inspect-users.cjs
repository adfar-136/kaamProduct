const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017/kaam");

async function run() {
  try {
    await client.connect();
    const db = client.db("kaam");
    const users = await db.collection("user").find({}).toArray();
    console.log("=== DB 'user' Collection Inspection ===");
    console.log(users);
    console.log("=======================================");
  } catch (error) {
    console.error("Inspection failed:", error);
  } finally {
    await client.close();
  }
}

run();
