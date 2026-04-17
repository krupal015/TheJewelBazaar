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
            .withMessage("username is required")
            .isLowercase()
            .withMessage(" username must be in lower case")
            .isLength({min:3})
            .withMessage("username must be at least 3 character long"),

            body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),

            body("fullName")
            .optional()
            .trim()
            .notEmpty(),
    ]       
}

const userLoginValidator = () =>{
    return [ 
        body("email")
        .optional()
            .isEmail()
            .notEmpty()
            .withMessage("Email is required"),

         body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),
    ]
}

const userChangeCurrentPasswordValidator= () => {
    return [
        body("oldPassword").notEmpty().withMessage("old password is required"),
         body("newPassword").notEmpty().withMessage("new password is required"),
    ]
}

const userForgotpasswordValidator = () =>{
    return [ 
        body("email").notEmpty().withMessage("email is required").isEmail().withMessage("email is invalid"),
    ]
}
export { userRegisterValidator ,
         userLoginValidator,
        userChangeCurrentPasswordValidator,
         userForgotpasswordValidator}