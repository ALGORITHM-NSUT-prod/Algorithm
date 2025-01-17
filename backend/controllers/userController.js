import FormData from "../models/formDataModel.js";
import { sendToken } from "../utils/sendToken.js";
import CoreMember from "../models/CoreMember.js";
import { transporter } from "../utils/MailClient.js";
import { Octokit } from "@octokit/rest";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  emailTemplate,
  passwordResetTemplate,
} from "../constants/emailTemplate.js";
import { fetchUserRanking } from "../processors/fetchQueueProcessor.js";

export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      personalEmail,
      phoneNumber,
      githubProfile,
      leetcodeProfile,
      codeforcesProfile,
      password,
      linkedinUrl,
      rollNumber,
      year,
    } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }
    if (githubProfile) {
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      try {
        const response = await octokit.rest.users.getByUsername({
          username: githubProfile.split("/").pop(),
        });
      } catch (error) {
        if (error.status === 404) {
          return res.status(422).json({
            message: "Github Profile not found",
          });
        } else {
          return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
        }
      }
    }
    // Check if user already exists with NSUT email
    let user = await FormData.findOne({ email });
    const Admin = await CoreMember.findOne({ email });

    if (user && user?.verified) {
      return res.status(401).json({
        message: "User with this NSUT Email Already Exists",
      });
    } else if (!user?.verified) {
      await FormData.deleteOne({ email });
    }

    let validLeetcodeProfile = null;
    let validCodeforcesProfile = null;

    if (leetcodeProfile !== undefined && leetcodeProfile !== "") {
      validLeetcodeProfile = leetcodeProfile === "N/A" ? null : leetcodeProfile;
    }
    if (codeforcesProfile !== undefined && codeforcesProfile !== "") {
      validCodeforcesProfile =
        codeforcesProfile === "N/A" ? null : codeforcesProfile;
    }

    // Create the new user, with admin status if applicable
    const isAdmin = !!Admin;
    user = await FormData.create({
      name,
      email,
      personalEmail,
      phoneNumber,
      githubProfile,
      leetcodeProfile: validLeetcodeProfile || "",
      codeforcesProfile: validCodeforcesProfile || "",
      linkedinUrl,
      rollNumber,
      year,
      password,
      admin: isAdmin,
      verified: false,
    });

    let rankingUpdateResult = null;
    if (validLeetcodeProfile || validCodeforcesProfile) {
      try {
        rankingUpdateResult = await fetchUserRanking(
          user,
          validCodeforcesProfile,
          validLeetcodeProfile
        );
      } catch (error) {
        console.error("Error in UserController:", error.message);
        res.status(500).send({ error: error.message });
      }
    }

    const verificationLink = `${process.env.CLIENT_URL}/verify/${user.id}`;
    try {
      // Send verification email

      const info = await transporter.sendMail({
        from: '"Algorithm" <algorithmnsut@gmail.com>',
        to: email,
        subject: "Email Verification - Algorithm Account",
        text: `Hello!\n\nThank you for signing up with Algorithm. Please verify your email by clicking on the following link: ${verificationLink}\n\nIf you did not create an account, please ignore this email.`,
        html: emailTemplate(verificationLink),
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError.message);
      return res.status(500).json({
        message: "Registration successful, but email verification failed",
        error: emailError.message,
      });
    }
    if (rankingUpdateResult) {
      sendToken(res, user, "Account registered and Leaderboard updated successfully", 200);
    } else {
      sendToken(res, user, "Account registered successfully", 200);
    }
  } catch (error) {
    console.log(error.message);
    return next(
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    );
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide both email and password",
      });
    }

    // Find user by email
    const user = await FormData.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.status(401).json({
        message: "Incorrect Email or Password",
      });
    }

    if (!user.verified) {
      return res.status(401).json({
        message: "User Not Verified",
      });
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect Email or Password",
      });
    }

    // Send token response
    sendToken(res, user, "Login successful", 200, remember);
  } catch (error) {
    return next(
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    );
  }
};

export const logout = async (req, res, next) => {
  try {
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    console.log(error);
    return next(
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    );
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const user = req.user._id;
    if (user === "") {
      return res.status(204).json({ message: "Session Expired, Login again!" });
    }
    const member = await FormData.findOne({ _id: user });
    if (!member) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    return next(
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    );
  }
};

export const checkPassword = async (req, res, next) => {
  try {
    const user = req.user._id;
    const member = await FormData.findOne({ _id: user });
    const { password } = req.body;

    const isMatch = await member.comparePassword(password);

    if (!member || !isMatch) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    return next(
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    );
  }
};

//TODO:  EDIT-PROFILE
export const editProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      personalEmail,
      phoneNumber,
      githubProfile,
      leetcodeProfile,
      codeforcesProfile,
      linkedinUrl,
      rollNumber,
      year,
    } = req.body;

    // Check if all required fields are provided
    if (!name || !email) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check if user exists with NSUT email
    let user = await FormData.findOne({ _id: req.user._id });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (githubProfile !== "") {
      if (user.githubProfile !== githubProfile) {
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        try {
          const response = await octokit.rest.users.getByUsername({
            username: githubProfile.split("/").pop(),
          });
        } catch (error) {
          if (error.status === 404) {
            return res.status(422).json({
              message: "Github Profile not found",
            });
          } else {
            return res.status(500).json({
              message: "Internal Server Error",
              error: error.message,
            });
          }
        }
      }
    }

    let updatedLeetcodeProfile = null;
    let updatedCodeforcesProfile = null;

    if (
      leetcodeProfile !== undefined &&
      leetcodeProfile !== user.leetcodeProfile
    ) {
      updatedLeetcodeProfile =
        leetcodeProfile === "N/A" || leetcodeProfile === ""
          ? user.leetcodeProfile
          : leetcodeProfile;
    }

    if (
      codeforcesProfile !== undefined &&
      codeforcesProfile !== user.codeforcesProfile
    ) {
      updatedCodeforcesProfile =
        codeforcesProfile === "N/A" || codeforcesProfile === ""
          ? user.codeforcesProfile
          : codeforcesProfile;
    }

    // Overwrite user's information
    user.name = name || user.name;
    user.personalEmail = personalEmail || ""; // If not provided, set to previous
    user.phoneNumber = phoneNumber || "";
    user.githubProfile = githubProfile || "";
    user.leetcodeProfile = leetcodeProfile || "";
    user.codeforcesProfile = codeforcesProfile || "";
    user.linkedinUrl = linkedinUrl || user.linkedinUrl;
    user.rollNumber = rollNumber || user.rollNumber;
    user.year = year || user.year;

    // Save the updated user
    await user.save();

    let rankingUpdatedResult;
    if (updatedLeetcodeProfile || updatedCodeforcesProfile) {
      try {
        rankingUpdatedResult = await fetchUserRanking(
          user,
          updatedCodeforcesProfile,
          updatedLeetcodeProfile
        );

        if (rankingUpdatedResult) {
          sendToken(res, user, "Leaderboard updated successfully", 200);
        } else {
          sendToken(res, user, "Account Edited successfully", 200);
        }
      } catch (error) {
        console.error("Error in UserController:", error.message);
        return res.status(500).send({ error: error.message });
      }
    }
  } catch (error) {
    return next(
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      })
    );
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    let user = await FormData.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        message: "User not registered",
      });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken; // Ensure your FormData model has this field
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Create reset link
    const resetLink = `${process.env.CLIENT_URL}/resetpass/${resetToken}`;

    try {
      // Send password reset email
      const info = await transporter.sendMail({
        from: '"Algorithm" <algorithmnsut@gmail.com>',
        to: email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click on the following link to reset your password: ${resetLink}`,
        html: passwordResetTemplate(resetLink), // Use the imported template
      });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError.message);
      return res.status(500).json({
        message:
          "Password reset email sent, but there was an error sending the email.",
        error: emailError.message,
      });
    }

    res.status(200).send({
      message: "Check your inbox or spam folder for the password reset link.",
    });
  } catch (e) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: e.message,
    });
  }
};
