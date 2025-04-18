const db = require("../models/db");

exports.getAnalytics = async (req, res) => {
  const userId = req.user.id;

  try {
    // Applications by status
    const [statusCounts] = await db.execute(
      `SELECT status, COUNT(*) as count
       FROM jobs
       WHERE user_id = ?
       GROUP BY status`,
      [userId]
    );

    // Applications over time (monthly)
    const [appsOverTime] = await db.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
       FROM jobs
       WHERE user_id = ?
       GROUP BY month
       ORDER BY month`,
      [userId]
    );

    // Companies with most applications
    const [topCompanies] = await db.execute(
      `SELECT company, COUNT(*) as count
       FROM jobs
       WHERE user_id = ?
       GROUP BY company
       ORDER BY count DESC
       LIMIT 5`,
      [userId]
    );

    // Offer-to-application ratio
    const [totalApps] = await db.execute(
      "SELECT COUNT(*) as total FROM jobs WHERE user_id = ?",
      [userId]
    );
    const [offers] = await db.execute(
      "SELECT COUNT(*) as offers FROM jobs WHERE user_id = ? AND status = 'Offer'",
      [userId]
    );
    const offerRatio =
      totalApps[0].total > 0 ? (offers[0].offers / totalApps[0].total) * 100 : 0;

    res.json({
      statusCounts,
      appsOverTime,
      topCompanies,
      offerRatio: offerRatio.toFixed(2),
    });
  } catch (err) {
    console.error("❌ Analytics error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};