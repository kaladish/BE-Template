const { logErrorEvent } = require("../common/logging");
const { Contract } = require("../model");
const { Op } = require("sequelize");
const { DeelControllerError, FAILED_GET_CONTRACT_BYID } = require("../common/error-messages");


const getContractById = async (contractId, profileId) => {
    try {
        const contract = await Contract.scope({
            method: ["isProfileRelated", profileId],
          }).findOne({ where: { id: contractId } });
        return contract
    } catch (error) {
        new DeelControllerError(FAILED_GET_CONTRACT_BYID)
    }
}

const getContractsByProfileId = async (profileId) => {
    try {
        const contract = await Contract.scope({
            method: ["isProfileRelated", profileId],
          }).findAll({ where: { status: { [Op.ne]: "terminated" } } });
        return contract
    } catch (error) {
        logErrorEvent('Error retrieving contracts by profile id.')
        return null
    }
}

module.exports = {
    getContractById,
    getContractsByProfileId
}