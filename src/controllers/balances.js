const {
  DeelControllerError,
  FAILED_TO_DEPOSIT,
} = require("../common/error-messages");
const { Job, Profile, sequelize } = require("../model");
const currency = require("currency.js");

const getTotalPerdingPayments = async (profileId) => {
  return await Job.sum("price", {
    where: {
      paid: null,
      "$Contract.ClientId$": profileId,
    },
    include: ["Contract"],
  });
};

const depositFunds = async (profileId, amount, userId) => {
  const MAX_DEPOSIT_SHARE = 0.25;
  const totalPendingPayments = await getTotalPerdingPayments(profileId);
  const maxDeposit =
    currency(totalPendingPayments).multiply(MAX_DEPOSIT_SHARE).value;
  if (amount > maxDeposit)
    throw new DeelControllerError(
      `Deposit rejected. Max deposit value for this client is ${maxDeposit}`
    );

  let response = {};
  await sequelize
    .transaction(async () => {
      const profile = await Profile.findOne({ where: { id: userId } });
      if (!profile) throw new DeelControllerError("User not found");
      profile.balance = currency(amount).add(currency(profile.balance));
      await profile.save();
      response = {
        message: "Deposit successful: Balance updated",
        target_user_id: userId,
      };
    })
    .catch((e) => {
      if (!(e instanceof DeelControllerError))
        throw new DeelControllerError(FAILED_TO_DEPOSIT);
      throw e;
    });
    return response
};

module.exports = { depositFunds };
