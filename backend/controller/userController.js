import User from "../models/userModel.js";

// Get logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Update logged-in user's profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update only provided fields
    if (name) {
      user.name = name;
    }

    if (phone) {
      user.phone = phone;
    }

    if (profileImage) {
      user.profileImage = profileImage;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
