const {
  DeelControllerError,
  FAILED_BEST_PROFESSIONS,
  FAILED_BEST_CLIENT,
} = require("../common/error-messages");
const { Job, sequelize } = require("../model");
const { Op } = require("sequelize");

const getBestProfession = async (startDate, endDate) => {
  try {
    const bestProfessions = await Job.findAll({
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [
            startDate.startOf("day").toISOString(),
            endDate.endOf("day").toISOString(),
          ],
        },
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("price")), "total"],
        "Contract.Contractor.profession",
      ],
      include: [
        {
          association: "Contract",
          include: ["Contractor"],
        },
      ],
      group: "Contract.Contractor.profession",
      order: [[sequelize.fn("sum", sequelize.col("price")), "DESC"]],
      limit: 1,
    });
    return bestProfessions;
  } catch (e) {
    throw new DeelControllerError(FAILED_BEST_PROFESSIONS);
  }
};

const getBestClients = async (startDate, endDate, limit) => {
  try {
    const bestClients = await Job.findAll({
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [
            startDate.startOf("day").toISOString(),
            endDate.endOf("day").toISOString(),
          ],
        },
      },
      attributes: [
        [sequelize.fn("sum", sequelize.col("price")), "total"],
        "Contract.Client.id",
      ],
      include: [
        {
          association: "Contract",
          include: ["Client"],
        },
      ],
      group: "Contract.Client.id",
      order: [[sequelize.fn("sum", sequelize.col("price")), "DESC"]],
      limit,
    });
    return bestClients;
  } catch (e) {
    throw new DeelControllerError(FAILED_BEST_CLIENT);
  }
};

module.exports = { getBestClients, getBestProfession };
