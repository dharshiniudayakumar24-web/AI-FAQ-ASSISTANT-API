import FAQ from "../models/FAQ.js";

export const searchFAQs = async (query, user = null) => {
  const filter = user
    ? {
        $or: [
          { isPublic: true },
          { userId: user._id }
        ]
      }
    : { isPublic: true };

  if (!query || !query.trim()) {
    return FAQ.find(filter)
      .populate("categoryId", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(20);
  }

  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 10);

  const regex = new RegExp(words.map((word) => escapeRegex(word)).join("|"), "i");

  return FAQ.find({
    $and: [
      filter,
      {
        $or: [
          { question: regex },
          { answer: regex },
          { tags: regex }
        ]
      }
    ]
  })
    .populate("categoryId", "name")
    .populate("userId", "name")
    .sort({ views: -1, createdAt: -1 })
    .limit(20);
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
