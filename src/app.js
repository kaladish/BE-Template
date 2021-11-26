const express = require("express");
const bodyParser = require("body-parser");
const { getProfile } = require("./middleware/getProfile");
const { isClient } = require("./middleware/isClient");
const moment = require("moment");
const { isPositiveInteger } = require("./common/isPositiveInteger");
const {
  getContractById,
  getContractsByProfileId,
} = require("./controllers/contracts");
const { getUnpaidJobs, payJob } = require("./controllers/jobs");
const { filterErrorMessage } = require("./common/error-messages");
const { depositFunds } = require("./controllers/balances");
const { getBestProfession, getBestClients } = require("./controllers/admin");

const app = express();
app.use(bodyParser.json());

const handleError = (res, e) => {
  res.status(500).json({ message: filterErrorMessage(e) });
};

app.get("/contracts/:id", getProfile, async (req, res) => {
  const { id } = req.params;
  const profileId = req.profile.id;
  try {
    const contract = await getContractById(id, profileId);
    if (!contract) return res.status(404).end();
    res.json(contract);
  } catch (e) {
    handleError(res, e);
  }
});

app.get("/contracts", getProfile, async (req, res) => {
  const profileId = req.profile.id;
  const contract = await getContractsByProfileId(profileId);
  res.json(contract);
});

app.get("/jobs/unpaid", getProfile, async (req, res) => {
  const profileId = req.profile.id;
  try {
    const jobs = await getUnpaidJobs(profileId);
    res.json(jobs);
  } catch (e) {
    handleError(res, e);
  }
});

app.post("/jobs/:jobId/pay", getProfile, isClient, async (req, res) => {
  const profileId = req.profile.id;
  const { jobId } = req.params;

  try {
    const paymentResult = await payJob(profileId, jobId);
    res.json(paymentResult);
  } catch (e) {
    handleError(res, e);
  }
});

app.post(
  "/balances/deposit/:userId",
  getProfile,
  isClient,
  async (req, res) => {
    const amount = parseInt(req.body.amount);
    const { userId } = req.params;
    const profileId = req.profile.id;

    if (!isPositiveInteger(amount))
      return res.status(400).json({ message: "Invalid amount" });
    
    try {
      const depositResult = await depositFunds(profileId, amount, userId)
      res.json(depositResult)
    } catch (e) {
      handleError(res, e);
    }
  }
);

app.get("/admin/best-profession", getProfile, async (req, res) => {
  let startDate = moment(req.query.start, moment.ISO_8601, true);
  let endDate = moment(req.query.end, moment.ISO_8601, true);

  if (!startDate.isValid() || !endDate.isValid() || startDate >= endDate)
    return res
      .status(400)
      .json({ message: "Invalid date. Please use ISO format" });
  try {
    const bestProfession = await getBestProfession(startDate, endDate)
    res.json(bestProfession)
  } catch (e) {
    handleError(res, e)
  }
  
});

app.get("/admin/best-clients", getProfile, async (req, res) => {
  const DEFAULT_LIMIT = 2;
  const MAX_LIMIT = 20;
  const startDate = moment(req.query.start, moment.ISO_8601, true);
  const endDate = moment(req.query.end, moment.ISO_8601, true);

  let limit = req.query.limit;
  if (!isPositiveInteger(limit)) limit = DEFAULT_LIMIT;
  limit = Math.min(limit, MAX_LIMIT);

  if (!startDate.isValid() || !endDate.isValid() || startDate >= endDate)
    return res
      .status(400)
      .json({ message: "Invalid date. Please use ISO format" });

    try {
      const bestClients = await getBestClients(startDate, endDate, limit)
      res.json(bestClients)
    } catch (e) {
      handleError(res, e)
    }
  
});

module.exports = app;
