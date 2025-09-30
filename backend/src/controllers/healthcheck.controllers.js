import { apiResponse } from "../utils/apiResponse.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";

const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(new apiResponse(200, { message: "Server is running" }));
});

export { healthCheck };
