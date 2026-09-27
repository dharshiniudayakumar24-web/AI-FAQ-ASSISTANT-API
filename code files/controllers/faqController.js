import FAQ from "../models/FAQ.js";
import Tag from "../models/Tag.js";
import FAQTag from "../models/FAQTag.js";
import { searchFAQs } from "../services/searchService.js";

const syncTags = async (faqId, tagNames = []) => {
  await FAQTag.deleteMany({ faqId });

  const cleanTags = [...new Set(
    tagNames
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean)
  )];

  for (const name of cleanTags) {
    const tag = await Tag.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await FAQTag.create({ faqId, tagId: tag._id });
  }

  return cleanTags;
};

export const createFAQ = async (req, res, next) => {
  try {
    const { question, answer, categoryId, tags = [], isPublic = false } = req.body;

    const faq = await FAQ.create({
      userId: req.user._id,
      categoryId,
      question,
      answer,
      tags,
      isPublic
    });

    await syncTags(faq._id, tags);

    const result = await FAQ.findById(faq._id)
      .populate("categoryId", "name")
      .populate("userId", "name email");

    res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      faq: result
    });
  } catch (error) {
    next(error);
  }
};


export const getAllFAQsForAdmin = async (req, res, next) => {
  try {
    const faqs = await FAQ.find()
      .populate("categoryId", "name")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: faqs.length,
      faqs
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ userId: req.user._id })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: faqs.length,
      faqs
    });
  } catch (error) {
    next(error);
  }
};

export const getFAQs = async (req, res, next) => {
  try {
    const filter = req.user
      ? {
          $or: [
            { isPublic: true },
            { userId: req.user._id }
          ]
        }
      : { isPublic: true };

    const faqs = await FAQ.find(filter)
      .populate("categoryId", "name")
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: faqs.length,
      faqs
    });
  } catch (error) {
    next(error);
  }
};

export const getFAQById = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id)
      .populate("categoryId", "name")
      .populate("userId", "name");

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    const isOwner = req.user && faq.userId &&
      faq.userId._id.toString() === req.user._id.toString();

    const isAdmin = req.user && req.user.role === "admin";

    if (!faq.isPublic && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "This FAQ is private"
      });
    }

    faq.views += 1;
    await faq.save();

    res.json({
      success: true,
      faq
    });
  } catch (error) {
    next(error);
  }
};

export const updateFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    req.faq = faq;

    if (
      req.user.role !== "admin" &&
      (
        req.user.role !== "content_creator" ||
        faq.userId.toString() !== req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You can edit only your own FAQs"
      });
    }

    const { question, answer, categoryId, tags, isPublic } = req.body;

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (categoryId !== undefined) faq.categoryId = categoryId;
    if (tags !== undefined) faq.tags = tags;
    if (isPublic !== undefined) faq.isPublic = isPublic;

    await faq.save();

    if (tags !== undefined) {
      await syncTags(faq._id, tags);
    }

    const result = await FAQ.findById(faq._id)
      .populate("categoryId", "name")
      .populate("userId", "name email");

    res.json({
      success: true,
      message: "FAQ updated successfully",
      faq: result
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      (
        req.user.role !== "content_creator" ||
        faq.userId.toString() !== req.user._id.toString()
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own FAQs"
      });
    }

    await FAQTag.deleteMany({ faqId: faq._id });
    await faq.deleteOne();

    res.json({
      success: true,
      message: "FAQ deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const search = async (req, res, next) => {
  try {
    const faqs = await searchFAQs(req.query.q, req.user);

    res.json({
      success: true,
      query: req.query.q || "",
      count: faqs.length,
      results: faqs
    });
  } catch (error) {
    next(error);
  }
};
