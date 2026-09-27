import AIGeneratedFAQ from "../models/AIGeneratedFAQ.js";
import FAQ from "../models/FAQ.js";
import { generateFAQ, generateAnswer } from "../services/geminiService.js";

export const generateFAQWithAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    const generated = await generateFAQ(prompt);

    const record = await AIGeneratedFAQ.create({
      userId: req.user._id,
      prompt,
      question: generated.question,
      answer: generated.answer,
      topicSuggestions: generated.topicSuggestions
    });

    res.status(201).json({
      success: true,
      message: "FAQ generated successfully",
      generatedFAQ: record
    });
  } catch (error) {
    next(error);
  }
};

export const saveGeneratedFAQ = async (req, res, next) => {
  try {
    const generated = await AIGeneratedFAQ.findById(req.params.id);

    if (!generated) {
      return res.status(404).json({
        success: false,
        message: "Generated FAQ not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      generated.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can save only your generated FAQ"
      });
    }

    const { categoryId, tags = [], isPublic = false } = req.body;

    const faq = await FAQ.create({
      userId: req.user._id,
      categoryId,
      question: generated.question,
      answer: generated.answer,
      tags,
      isPublic
    });

    generated.status = "saved";
    generated.savedFaqId = faq._id;
    await generated.save();

    res.status(201).json({
      success: true,
      message: "AI-generated FAQ saved to FAQ collection",
      faq,
      generatedFAQ: generated
    });
  } catch (error) {
    next(error);
  }
};

export const answerQuestionWithAI = async (req, res, next) => {
  try {
    const { question } = req.body;

    const contextFAQs = await FAQ.find({
      isPublic: true,
      $text: { $search: question }
    })
      .limit(5)
      .select("question answer");

    const context = contextFAQs
      .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
      .join("\n\n");

    const answer = await generateAnswer(question, context);

    res.json({
      success: true,
      question,
      answer,
      contextUsed: contextFAQs.length
    });
  } catch (error) {
    next(error);
  }
};

export const getAIGeneratedFAQs = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { userId: req.user._id };

    const records = await AIGeneratedFAQ.find(filter)
      .populate("userId", "name email")
      .populate("savedFaqId", "question answer")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      generatedFAQs: records
    });
  } catch (error) {
    next(error);
  }
};
