const { logErrorEvent } = require("./logging");

const INVALID_TOKEN = "Invalid token";
const INVALID_QUERY = "Invalid request";

// CONTRACTS
const FAILED_GET_CONTRACT_BYID = "Error retrieving contract by id.";

// JOBS
const FAILED_GET_UNPAID_JOBS = "Failed retrieving unpaid jobs";
const FAILED_PAY_JOB = "Failed to pay for job";

// DEPOSIT
const FAILED_TO_DEPOSIT = "Failed to deposit funds."

// ADMIN
const FAILED_BEST_PROFESSIONS = "Failed to request best professions."
const FAILED_BEST_CLIENT = "Failed to request best CLIENT."


class DeelControllerError extends Error {
  constructor(message) {
    super(message);
    logErrorEvent(message);
  }
}

const filterErrorMessage = (error) => {
  if (error instanceof DeelControllerError) {
    return error.message;
  }
  return "Internal server error";
};

module.exports = {
  FAILED_GET_UNPAID_JOBS,
  FAILED_GET_CONTRACT_BYID,
  FAILED_TO_DEPOSIT,
  FAILED_PAY_JOB,
  INVALID_TOKEN,
  INVALID_QUERY,
  FAILED_BEST_PROFESSIONS,
  FAILED_BEST_CLIENT,
  DeelControllerError,
  filterErrorMessage,
};
