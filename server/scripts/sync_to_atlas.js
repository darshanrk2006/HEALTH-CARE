import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://localhost:27017/titanvitals';
const ATLAS_URI = process.argv[2] || process.env.MONGODB_URI;

if (!ATLAS_URI || ATLAS_URI.includes('localhost')) {
  console.error('\n❌ Please provide your MongoDB Atlas connection string:');
  console.log('Usage: node server/scripts/sync_to_atlas.js "mongodb+srv://admin:pass@cluster.mongodb.net/titanvitals"\n');
  process.exit(1);
}

async function syncDatabases() {
  console.log('\n🚀 Starting Local-to-Atlas Database Migration...\n');

  try {
    // 1. Connect to Local MongoDB
    console.log('📡 Connecting to Local MongoDB (localhost:27017/titanvitals)...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to Local MongoDB.');

    // 2. Connect to Remote MongoDB Atlas
    console.log('☁️ Connecting to MongoDB Atlas Cluster...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas.');

    // 3. Get all collections from local
    const collections = await localConn.db.listCollections().toArray();
    console.log(`\n📦 Found ${collections.length} collections to transfer:`, collections.map(c => c.name).join(', '));

    for (const colInfo of collections) {
      const colName = colInfo.name;
      if (colName.startsWith('system.')) continue;

      const localCollection = localConn.db.collection(colName);
      const atlasCollection = atlasConn.db.collection(colName);

      const docs = await localCollection.find({}).toArray();
      if (docs.length > 0) {
        // Clear destination collection to avoid duplicate ID conflicts
        await atlasCollection.deleteMany({});
        await atlasCollection.insertMany(docs);
        console.log(`   ✨ Transferred "${colName}": ${docs.length} documents copied.`);
      } else {
        console.log(`   ℹ️ Collection "${colName}" is empty, skipped.`);
      }
    }

    console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY TRANSFERRED TO MONGODB ATLAS!\n');
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration Failed:', err.message);
    process.exit(1);
  }
}

syncDatabases();
