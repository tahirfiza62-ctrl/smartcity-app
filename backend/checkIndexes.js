const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, ".env"),
});

async function removeIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");
    console.log(
      "Database:",
      mongoose.connection.db.databaseName
    );

    const collection =
      mongoose.connection.db.collection("payments");

    const indexes = await collection.indexes();

    console.log("\n========== CURRENT INDEXES ==========");
    console.log(
      JSON.stringify(indexes, null, 2)
    );

    const indexesToRemove = [
      "referenceNumber_1",
      "transactionId_1",
    ];

    for (const indexName of indexesToRemove) {
      const exists = indexes.some(
        (index) => index.name === indexName
      );

      if (exists) {
        console.log(`\n❌ Found ${indexName}`);
        console.log(`Removing ${indexName}...`);

        await collection.dropIndex(indexName);

        console.log(
          `✅ ${indexName} removed successfully`
        );
      } else {
        console.log(
          `\n✅ ${indexName} not found`
        );
      }
    }

    const finalIndexes =
      await collection.indexes();

    console.log("\n========== FINAL INDEXES ==========");
    console.log(
      JSON.stringify(
        finalIndexes,
        null,
        2
      )
    );

    await mongoose.connection.close();

    console.log(
      "\n✅ Done. MongoDB connection closed."
    );

  } catch (error) {
    console.error("\n❌ ERROR:");
    console.error(error);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
}

removeIndexes();