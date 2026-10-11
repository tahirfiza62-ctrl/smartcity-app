const Notification = require("../models/Notification");

const createNotification = async ({
  userId,
  type,
  title,
  message,
  referenceId = null,
}) => {
  if (!userId) {
    console.log(
      "Notification skipped: No user ID provided."
    );

    return null;
  }

  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      referenceId,
    });

    return notification;

  } catch (error) {
    console.error(
      "Create Notification Error:",
      error
    );

    return null;
  }
};

module.exports = createNotification;