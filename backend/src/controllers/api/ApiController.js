const Response = require("../../utils/response.js");

module.exports = {
  /**
   * This is an sample API controller.
   * @param {*} req
   * @param {*} res
   * @returns
   */
  sample: async (req, res) => {
    return res.json(Response.success("Get User", req.user));
  },
};
