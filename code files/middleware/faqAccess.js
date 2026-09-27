export const canModifyFAQ = (req, res, next) => {
  if (req.user.role === "admin") return next();

  if (
    req.user.role === "content_creator" &&
    req.faq.userId.toString() === req.user._id.toString()
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "You can modify only FAQs you own"
  });
};
