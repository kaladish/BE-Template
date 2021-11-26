const {
  DeelControllerError,
  FAILED_GET_UNPAID_JOBS,
  FAILED_PAY_JOB,
} = require("../common/error-messages");
const { Job, sequelize } = require("../model");
const currency = require("currency.js");

const getUnpaidJobs = async (profileId) => {
  try {
    const job = await Job.scope([
      "isContractActive",
      "isUnpaid",
      { method: ["isProfileRelated", profileId] },
    ]).findAll();
    return job;
  } catch (e) {
    throw new DeelControllerError(FAILED_GET_UNPAID_JOBS);
  }
};

const getPayableJob = async (profileId, jobId) => {
  return Job.scope([
    "isUnpaid",
    { method: ["isProfileRelated", profileId] },
  ]).findOne({
    where: { id: jobId },
    include: [
      //Eager Loading
      {
        association: "Contract",
        include: ["Client", "Contractor"],
      },
    ],
  });
};

const payJob = async (profileId, jobId) => {
  let response = {};
  await sequelize
    .transaction(async () => {
      const job = await getPayableJob(profileId, jobId);
      if (!job) throw new DeelControllerError("No job matches");

      const { Contractor, Client } = job.Contract;
      if (Client.balance < job.price) {
        throw new DeelControllerError("Insufficient funds");
      }

      const newContractorBalance = currency(Contractor.balance).add(
        currency(job.price)
      ).value;
      const newClientBalance = currency(Client.balance).subtract(
        currency(job.price)
      ).value;

      Contractor.balance = newContractorBalance;
      Client.balance = newClientBalance;
      job.paid = true;

      await Promise.all([Contractor.save(), Client.save(), job.save()]);
      response = {
        message: "Payment successfull",
        id: job.id,
        amount_paid: job.price,
      };
    })
    .catch((e) => {
      if (!(e instanceof DeelControllerError))
        throw new DeelControllerError(FAILED_PAY_JOB);
      throw e;
    });
  return response;
};

module.exports = { getUnpaidJobs, payJob };
