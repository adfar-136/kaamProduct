const { MongoClient, ObjectId } = require("mongodb");

async function test() {
  const client = new MongoClient("mongodb://localhost:27017/kaam");
  try {
    await client.connect();
    const db = client.db("kaam");
    
    const userIdStr = "6a1b0c33033aba85ad5fb636";
    console.log("Searching user:", userIdStr);
    
    const user = await db.collection("user").findOne({ _id: new ObjectId(userIdStr) });
    console.log("Found user:", user);
    
    const teamId = "6a1b0d02033aba85ad5fb63c";
    console.log("Updating user role to manager and team_id to:", teamId);
    
    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(userIdStr) },
      { $set: { role: "manager", team_id: teamId } }
    );
    
    console.log("Update result:", result);
    
    const updatedUser = await db.collection("user").findOne({ _id: new ObjectId(userIdStr) });
    console.log("Updated user in DB:", updatedUser);
    
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}

test();
