const {
  DeelControllerError,
  FAILED_TO_DEPOSIT,
} = require("../common/error-messages");
const { Job, Profile, sequelize } = require("../model");
const currency = require("currency.js");

const MAX_DEPOSIT_SHARE = 0.25;

const getTotalPerdingPayments = async (profileId) => {
  return await Job.sum("price", {
    where: {
      paid: null,
      "$Contract.ClientId$": profileId,
    },
    include: ["Contract"],
  });
};

const hasEnoughFunds = (totalPendingPayments, depositAmount) => {
  const maxDeposit =
    currency(totalPendingPayments).multiply(MAX_DEPOSIT_SHARE).value;
  return depositAmount > maxDeposit
}

const depositFunds = async (profileId, amount, userId) => {
  const totalPendingPayments = await getTotalPerdingPayments(profileId);
  
  if (!hasEnoughFunds(totalPendingPayments,amount))
    throw new DeelControllerError(
      `Deposit rejected. Amount exceeds allowed limit.`
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
