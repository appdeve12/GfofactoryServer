const cron = require("node-cron");

const StockOutward = require("./modals/StockOutward");
const User = require("./modals/User.modal");
const sendEmail = require("./utils/sendEmail"); // custom email function

// Run daily at 6 PM
cron.schedule("0 18 * * 1-6", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get all admin users
    const admins = await User.find({ role: "admin" });

    // Loop through each admin
    for (const admin of admins) {
      const stockEntry = await StockOutward.findOne({
        user: admin._id,
        date: { $gte: today, $lt: tomorrow },
      });

      if (!stockEntry) {
        // No entry made today, find supervisor(s)
        const supervisors = await User.find({ role: "supervisior" });

        for (const supervisor of supervisors) {
          // Send email
          await sendEmail({
            to: supervisor.email,
            subject: `Missing StockOutward Report`,
            text: `Admin ${admin.name} did not submit StockOutward report for today (${today.toDateString()}).`,
          });
        }
      }
    }

    console.log("StockOutward check complete.");
  } catch (err) {
    console.error("Error in scheduled job:", err);
  }
});
