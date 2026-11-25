const { PrismaClient } = require("@prisma/client");

async function checkConnection() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("DB_STATUS: CONNECTED");
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log("DB_STATUS: FAILED_TO_CONNECT");
    console.log("ERROR_NAME:", error.name || "Error");
    console.log("ERROR_CODE:", error.code || "N/A");
    console.log(
      "ERROR_REASON:",
      error.message ? error.message.split("\n")[0] : "Connection refused"
    );
    await prisma.$disconnect();
    return false;
  }
}

checkConnection().then((connected) => {
  process.exit(connected ? 0 : 1);
});
