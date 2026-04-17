import { ApiResponse } from "../utils/ApiResponse.js";

export const healthCheck = (_req, res) => {
  res.status(200).json(new ApiResponse("API is healthy"));
};
