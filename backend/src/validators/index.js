import { body } from "express-validator";
const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lower case")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("fullName").optional().trim(),
  ];
};

const emailValidator = () => {
  return [
    body("email")
    .notEmpty()
    .withMessage("email should be not empty")
        .isEmail()
        .withMessage("Email is invalid"),
    body("password")
        .notEmpty()
        .withMessage("password should be not empty")
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email").notEmpty().withMessage("email can't be empty").isEmail().withMessage("not valid email")
  ]
}

const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").notEmpty().withMessage("old password can't be empty"),
    body("newPassword").notEmpty().withMessage("new password can't be empty").isLength({min:3}).withMessage("password must be at least 3 characters long"),
  ] 
}

const userResetForgotPassword = () => {
  return [
    body("newPassword").notEmpty().withMessage("password is required")
  ]
}

export {userRegisterValidator,emailValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPassword};