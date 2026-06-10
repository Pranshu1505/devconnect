const Job = require("../models/Job");
const Notification = require("../models/Notification");

// @desc    Get all jobs with filters
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { type, location, experience, stack, search, remote } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (type) query.type = type;
    if (experience) query.experience = experience;
    if (remote === "true") query.isRemote = true;
    if (location) query.location = new RegExp(location, "i");
    if (stack) query.stack = { $in: stack.split(",").map((s) => s.trim().toLowerCase()) };
    if (search) query.$text = { $search: search };

    // Boosted jobs come first
    const jobs = await Job.find(query)
      .populate("company", "name username avatar companyName companyWebsite")
      .sort({ isBoosted: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "company",
      "name username avatar companyName companyWebsite companySize location"
    );

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @desc    Create job (company only)
// @route   POST /api/jobs
// @access  Private (company)
const createJob = async (req, res, next) => {
  try {
    const {
      title, description, requirements, stack,
      location, type, experience, salaryMin,
      salaryMax, currency, isRemote, deadline,
    } = req.body;

    const job = await Job.create({
      title, description,
      requirements: requirements || [],
      stack: stack || [],
      location, type, experience,
      salaryMin, salaryMax,
      currency: currency || "INR",
      isRemote: isRemote || false,
      deadline,
      company: req.user._id,
    });

    const populated = await job.populate("company", "name username avatar companyName");
    res.status(201).json({ success: true, job: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (company owner)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    Object.assign(job, req.body);
    await job.save();
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (company owner or admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const isOwner = job.company.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await job.deleteOne();
    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private (developer only)
const applyJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (!job.isActive) return res.status(400).json({ success: false, message: "Job is closed" });

    const alreadyApplied = job.applications.some(
      (a) => a.applicant.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    job.applications.push({
      applicant: req.user._id,
      coverLetter: req.body.coverLetter || "",
    });
    await job.save();

    // Notify company
    await Notification.create({
      recipient: job.company,
      sender: req.user._id,
      type: "job_application",
      job: job._id,
    });

    const io = req.app.get("io");
    io.to(job.company.toString()).emit("notification", { type: "job_application" });

    res.json({ success: true, message: "Applied successfully" });
  } catch (err) {
    next(err);
  }
};

// @desc    Get applications for a job (company dashboard)
// @route   GET /api/jobs/:id/applications
// @access  Private (company owner)
const getApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "applications.applicant",
      "name username avatar bio skills githubUrl portfolioUrl location"
    );

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, applications: job.applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Update application status
// @route   PUT /api/jobs/:id/applications/:appId
// @access  Private (company owner)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    if (job.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const application = job.applications.id(req.params.appId);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    application.status = req.body.status;
    await job.save();

    // Notify applicant
    await Notification.create({
      recipient: application.applicant,
      sender: req.user._id,
      type: "job_status",
      job: job._id,
      message: `Your application status: ${req.body.status}`,
    });

    const io = req.app.get("io");
    io.to(application.applicant.toString()).emit("notification", { type: "job_status" });

    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobs, getJob, createJob, updateJob, deleteJob,
  applyJob, getApplications, updateApplicationStatus,
};