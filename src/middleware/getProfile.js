const { isPositiveInteger } = require("../common/isPositiveInteger");
const { logErrorEvent } = require("../common/logging");
const { Profile} = require("../model");


const getProfile = async (req, res, next) => {
  const profileId = req.get("profile_id");
  if (!isPositiveInteger(profileId)) return res.status(401).end();

  try {
    const profile = await Profile.findOne({ where: { id: profileId } });

    if (!profile) return res.status(401).end();
    req.profile = profile;
    next();
  } catch (error) {
    logErrorEvent(error);
    return res.status(401).end();
  }
};

module.exports = { getProfile };
