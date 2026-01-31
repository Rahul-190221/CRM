require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { addHours, addMinutes, format } = require("date-fns");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 5000;
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "https://luminedge.io",
      "https://testingfunctionality.netlify.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1000mb" }));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const db = client.db("luminedge");
    const usersCollection = db.collection("users");
    const coursesCollection = db.collection("courses");
    const schedulesCollection = db.collection("schedules");
    const bookingMockCollection = db.collection("bookingMock");

    app.get("/api/v1/courses", async (req, res) => {
      const courses = await coursesCollection.find({}).toArray();
      res.json({ courses });
    });

    const pad2 = (n) => String(n).padStart(2, "0");
    const toHHMM = (v) => {
      const [h = "0", m = "0"] = String(v || "").split(":");
      return `${pad2(+h)}:${pad2(+m)}`;
    };
    const toHHMMSS = (v) => {
      const [h = "0", m = "0", s = "0"] = String(v || "").split(":");
      return `${pad2(+h)}:${pad2(+m)}:${pad2(+s)}`;
    };
    const normalizeIncomingSlot = (slot) => {
      const s = toHHMM(slot.startTime);
      const e = toHHMM(slot.endTime);
      return {
        startTime: toHHMMSS(s),
        endTime: toHHMMSS(e),
        slot: Number(slot.slot ?? 0),
        totalSlot: Number(slot.totalSlot ?? slot.slot ?? 0),
      };
    };

    async function getMaxSlotIdAcrossDocs(col, key) {
      const [row] = await col
        .aggregate([
          { $match: key },
          { $unwind: "$timeSlots" },
          {
            $project: {
              n: {
                $toInt: {
                  $ifNull: [
                    {
                      $cond: [
                        { $isNumber: "$timeSlots.slotId" },
                        "$timeSlots.slotId",
                        { $toInt: { $ifNull: ["$timeSlots.slotId", 0] } },
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
          { $group: { _id: null, maxId: { $max: "$n" } } },
          { $project: { _id: 0, maxId: 1 } },
        ])
        .toArray();

      return row?.maxId || 0;
    }

    app.post("/api/v1/admin/create-schedule", async (req, res) => {
      const payload = Array.isArray(req.body) ? req.body : [];
      const successful = [];
      const failed = [];
      const nowIso = new Date().toISOString();

      try {
        for (const incoming of payload) {
          const { courseId, startDate, endDate, testType } = incoming || {};
          if (!courseId || !startDate || !endDate) {
            failed.push({
              courseId: courseId || "",
              startDate: startDate || "",
              endDate: endDate || "",
              message: "Missing courseId/startDate/endDate",
              timestamp: nowIso,
            });
            continue;
          }

          const key = { courseId, startDate, endDate, testType };

          let nextId = await getMaxSlotIdAcrossDocs(schedulesCollection, key);

          const incomingSlots = Array.isArray(incoming.timeSlots)
            ? incoming.timeSlots.map(normalizeIncomingSlot)
            : [];

          if (!incomingSlots.length) {
            failed.push({
              courseId,
              startDate,
              endDate,
              message: "No time slots provided.",
              timestamp: nowIso,
            });
            continue;
          }

          for (const s of incomingSlots) {
            nextId += 1;
            const doc = {
              courseId,
              startDate,
              endDate,
              name: incoming.name ?? "",
              testSystem: incoming.testSystem ?? "",
              testType: testType ?? "",
              status: incoming.status ?? "Scheduled",
              timeSlots: [{ ...s, slotId: String(nextId) }],
              createdAt: nowIso,
            };

            await schedulesCollection.insertOne(doc);
            successful.push({
              courseId,
              startDate,
              endDate,
              assignedSlotId: String(nextId),
              createdAt: nowIso,
            });
          }
        }

        if (!successful.length) {
          return res.status(409).json({
            success: false,
            message: "No schedules created.",
            successfulSchedules: successful,
            failedSchedules: failed,
          });
        }

        return res.status(failed.length ? 207 : 201).json({
          success: true,
          message: failed.length
            ? "Schedules created (some skipped)."
            : "Schedules created successfully.",
          successfulSchedules: successful,
          failedSchedules: failed,
        });
      } catch (err) {
        console.error("create-schedule error:", err);
        return res.status(500).json({
          success: false,
          message: "Server error while creating schedules",
        });
      }
    });

    app.get("/api/v1/schedule/:date/:courseId", async (req, res) => {
      try {
        const { date, courseId } = req.params;

        const schedules = await schedulesCollection
          .aggregate([
            {
              $match: {
                courseId,
                startDate: date,
                endDate: date,
                status: { $ne: "Cancelled" },
              },
            },
            {
              $addFields: {
                _slotIdNum: {
                  $cond: [
                    { $gt: [{ $size: "$timeSlots" }, 0] },
                    {
                      $toInt: {
                        $ifNull: [
                          {
                            $cond: [
                              {
                                $isNumber: {
                                  $arrayElemAt: ["$timeSlots.slotId", 0],
                                },
                              },
                              { $arrayElemAt: ["$timeSlots.slotId", 0] },
                              {
                                $toInt: {
                                  $arrayElemAt: ["$timeSlots.slotId", 0],
                                },
                              },
                            ],
                          },
                          0,
                        ],
                      },
                    },
                    0,
                  ],
                },
              },
            },
            { $sort: { _slotIdNum: 1, startDate: 1, _id: 1 } },
            { $project: { _slotIdNum: 0 } },
          ])
          .toArray();

        res.json({ schedules });
      } catch (e) {
        console.error("schedule by date error:", e);
        res.status(500).json({ message: "Failed to load schedules" });
      }
    });

    app.get("/api/v1/schedule/:userId", async (req, res) => {
      const { userId } = req.params;
      const schedules = await schedulesCollection
        .find({ userId: userId })
        .toArray();
      res.json({ schedules });
    });

    app.post("/api/v1/user/book-slot", async (req, res) => {
      try {
        const {
          scheduleId,
          userId,
          slotId,
          testType,
          testSystem,
          name,
          location,
          bookingDate,
          testTime,
        } = req.body;

        if (!userId || !location) {
          return res.status(400).json({
            message:
              "Missing required fields. 'userId' and 'location' are required.",
          });
        }

        if (!ObjectId.isValid(userId)) {
          return res
            .status(400)
            .json({ message: "Invalid user ID format." });
        }

        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (!user || user.mock <= 0) {
          return res
            .status(400)
            .json({ message: "Insufficient mock tests available." });
        }

        const resolvedMockType = (name || user.mockType || "")
          .toString()
          .trim();
        const resolvedTestType = (testType || user.testType || "")
          .toString()
          .trim();

        if (resolvedMockType && resolvedTestType) {
          const lowerCourse = resolvedMockType.toLowerCase();
          const lowerTestType = resolvedTestType.toLowerCase();

          const purchasedForCourse = (Array.isArray(user.mocks)
            ? user.mocks
            : []
          )
            .filter((m) => {
              const mCourse = (m.mockType || "")
                .toString()
                .trim()
                .toLowerCase();
              const mType = (m.testType || "")
                .toString()
                .trim()
                .toLowerCase();
              return mCourse === lowerCourse && mType === lowerTestType;
            })
            .reduce((sum, m) => sum + (Number(m.mock) || 0), 0);

          if (purchasedForCourse > 0) {
            const usedForCourse = await bookingMockCollection.countDocuments({
              userId,
              name: resolvedMockType,
              testType: resolvedTestType,
            });

            if (usedForCourse >= purchasedForCourse) {
              return res.status(400).json({
                message: "Insufficient mock tests available.",
              });
            }
          }
        }

        if (location === "Home") {
          if (!bookingDate || !testTime) {
            return res.status(400).json({
              message: "Please select a booking date and test time.",
            });
          }

          const userTestType = testType || user.testType || "Unknown";
          const userTestName = name || user.name || "Unknown";

          const existingBooking = await bookingMockCollection.findOne({
            userId,
            bookingDate,
            location: "Home",
          });

          if (existingBooking) {
            return res.status(400).json({
              message: "You already have a test booked for this date.",
            });
          }

          const bookingRecord = {
            userId,
            location: "Home",
            status: "pending",
            name: userTestName,
            testType: userTestType,
            testSystem: testSystem || "N/A",
            bookingDate,
            testTime,
          };

          await bookingMockCollection.insertOne(bookingRecord);

          const updateMock = await usersCollection.updateOne(
            { _id: new ObjectId(userId), mock: { $gt: 0 } },
            { $inc: { mock: -1 } }
          );

          if (updateMock.modifiedCount === 0) {
            return res.status(400).json({
              message:
                "Failed to update mock count. Please try again.",
            });
          }

          res.json({
            success: true,
            message: "Home test booked successfully",
            bookingRecord,
          });

          sendBookingConfirmationEmail(user, bookingRecord);
          return;
        }

        if (location === "Test Center") {
          if (!scheduleId || !slotId || !testType || !name) {
            return res.status(400).json({
              message:
                "Missing required fields: 'scheduleId', 'slotId', 'testType', and 'name' are required for Test Center bookings.",
            });
          }

          if (
            typeof testSystem === "string" &&
            testSystem.trim() === ""
          ) {
            return res.status(400).json({
              message:
                "'testSystem' is required because a selection field was shown.",
            });
          }

          if (!ObjectId.isValid(scheduleId)) {
            return res
              .status(400)
              .json({ message: "Invalid schedule ID format." });
          }

          const schedule = await schedulesCollection.findOne({
            _id: new ObjectId(scheduleId),
          });
          if (!schedule) {
            return res
              .status(404)
              .json({ message: "Schedule not found." });
          }

          const selectedTimeSlot = schedule.timeSlots.find(
            (slot) => slot.slotId === slotId
          );
          if (
            !selectedTimeSlot ||
            Number(selectedTimeSlot.slot) < 1
          ) {
            return res.status(400).json({
              message:
                "Invalid or unavailable time slot selected.",
            });
          }

          const existingBooking = await bookingMockCollection.findOne({
            userId,
            scheduleId,
            bookingDate: schedule.startDate,
            slotId,
          });
          if (existingBooking) {
            return res.status(400).json({
              message:
                "You have already booked a slot for this date.",
            });
          }

          const session = client.startSession();
          session.startTransaction();

          try {
            const slotUpdate = await schedulesCollection.updateOne(
              {
                _id: new ObjectId(scheduleId),
                "timeSlots.slotId": slotId,
              },
              { $inc: { "timeSlots.$.slot": -1 } },
              { session }
            );
            if (slotUpdate.modifiedCount === 0)
              throw new Error("Failed to update slot availability");

            const userUpdate = await usersCollection.updateOne(
              { _id: new ObjectId(userId), mock: { $gt: 0 } },
              { $inc: { mock: -1 } },
              { session }
            );
            if (userUpdate.modifiedCount === 0)
              throw new Error("Failed to update user mock count");

            const bookingRecord = {
              userId,
              scheduleId,
              slotId,
              status: "pending",
              name,
              testType,
              testSystem: testSystem || null,
              bookingDate: schedule.startDate,
              startTime: selectedTimeSlot.startTime,
              endTime: selectedTimeSlot.endTime,
              location: "Test Center",
            };

            await bookingMockCollection.insertOne(bookingRecord, {
              session,
            });

            await session.commitTransaction();
            session.endSession();

            res.json({
              success: true,
              message:
                "Test Center test booked successfully",
              bookingRecord,
            });

            sendBookingConfirmationEmail(user, bookingRecord);
          } catch (err) {
            await session.abortTransaction();
            session.endSession();
            throw err;
          }
        } else {
          return res.status(400).json({
            message:
              "Invalid location type. Must be 'Home' or 'Test Center'.",
          });
        }
      } catch (error) {
        console.error("Error booking slot:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    async function sendBookingConfirmationEmail(user, bookingRecord) {
      try {
        const bookingDateFormatted = new Date(
          bookingRecord.bookingDate
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        function convertTo12HourFormat(timeString) {
          if (!timeString) return "Not Available";
          const [hours, minutes] = timeString
            .split(":")
            .map(Number);
          const ampm = hours >= 12 ? "PM" : "AM";
          const formattedHours = hours % 12 || 12;
          return `${formattedHours}:${minutes
            .toString()
            .padStart(2, "0")} ${ampm}`;
        }

        const testTimeRaw =
          bookingRecord.location === "Home"
            ? bookingRecord.testTime
            : bookingRecord.startTime;

        const testTime = convertTo12HourFormat(testTimeRaw);

        const subject = `Confirmation: Mock Test Booking for ${bookingDateFormatted}`;
        const messageContent = `
        <div>
          <p>Dear ${user.name || "Student"},</p>
          <p>This is a friendly reminder that your mock test is scheduled for <strong>${bookingDateFormatted}</strong>. Please find the details below:</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Test Title: ${bookingRecord.name} ${bookingRecord.testType}</li>
            <li>Test Date: ${bookingDateFormatted}</li>
            <li>Test Time: ${testTime}</li>
            <li>Test Location: ${bookingRecord.location}</li>
            <li>Reporting Time: 30 minutes before Test Time</li>
            <li>Office Address: Level 12, Gawsia Twin Peak, 743 Satmasjid Road, Dhanmondi 9/A, Dhaka-1205, Bangladesh.</li>
          </ul>
          <p><strong>Important Instructions:</strong></p>
          <ul>
            <li>Arrive at least 30 minutes before the test time for check-in.</li>
            <li>Bring a valid photo ID (Passport/NID) that matches the ID information provided at the time of account creation.</li>
            <li>Bring your own stationery items (pens, pencils, erasers) as they will not be provided at the test venue.</li>
          </ul>
          <p><strong>Mock Test Terms & Conditions:</strong></p>
          <ul>
            <li>Purchased or course-provided mock test(s) must be used within 6 months of the MR date.</li>
            <li>Free mock test(s) must be taken within 10 days of the MR date.</li>
            <li>Mock test rescheduling requests must be made 24 hours prior to the booked test date.</li>
            <li>Any mismatch between the provided ID details and the ID shown on the test day may result in test cancellation, and no refunds will be issued in such cases.</li>
            <li>Late arrivals, no-shows, invalid photo IDs, or expired service validity may result in forfeiting the test, with no refund requests entertained.</li>
            <li>Students are required to maintain professional behavior with Luminedge employees at all times. Any instance of misbehavior may result in service cancellation, with no refund issued.</li>
          </ul>
          <p>To facilitate a smooth check-in process, kindly present your valid photo ID (Passport/NID) voucher to our office executive upon arrival. This step is crucial to confirm your eligibility for the mock test.</p>
          <p>We sincerely appreciate your cooperation in adhering to these guidelines. Your punctuality and preparedness will contribute to a successful and efficient mock test experience.</p>
          <p>Thank you for choosing Luminedge for your test preparation needs. If you have any questions or require further assistance, please do not hesitate to contact us.</p>
          <p>📞 01400-406374 | 01400-403475 | 01400-403486 | 01400-403487 | 01400-403493 | 01400-403494</p>
          <p>We wish you the best for your mock test!</p>
          <p>Best regards,</p>
          <p>The Luminedge Team</p>
        </div>
      `;

        await emailSender(subject, user.email, messageContent);
        console.log(
          `Confirmation email sent successfully to ${user.email}`
        );
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }

    app.post("/api/v1/send-reminder", async (req, res) => {
      const { emails } = req.body;

      if (!emails || !emails.length) {
        return res
          .status(400)
          .json({ message: "No email data provided." });
      }

      try {
        const emailPromises = emails.map(
          ({ email, subject, message }) =>
            emailSender(subject, email, message)
        );

        await Promise.all(emailPromises);

        res
          .status(200)
          .json({ message: "Emails sent successfully!" });
      } catch (error) {
        console.error("Error sending emails:", error);
        res
          .status(500)
          .json({ message: "Failed to send emails." });
      }
    });

    const cron = require("node-cron");
    const { differenceInDays, parseISO } = require("date-fns");
    const sanitizeHtml = require("sanitize-html");
    const { emailSender } = require("./emailSender");

    const delay = (ms) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    cron.schedule(
      "00 10 * * *",
      async () => {
        console.log(
          "⏰ Started reminder check for mock expiries..."
        );

        try {
          const db = client.db("luminedge");
          const usersCollection = db.collection("users");

          const today = new Date();
          const users = await usersCollection.find({}).toArray();

          for (const user of users) {
            try {
              if (
                !Array.isArray(user.mocks) ||
                user.mocks.length === 0
              )
                continue;

              const expiringMocks = user.mocks.filter((mock) => {
                if (!mock.mrValidationExpiry) return false;

                let expiryDate;
                try {
                  expiryDate = parseISO(mock.mrValidationExpiry);
                  if (isNaN(expiryDate)) return false;
                } catch {
                  console.warn(
                    `⚠️ Invalid expiry date for ${user.email}`
                  );
                  return false;
                }

                const daysDiff = differenceInDays(
                  expiryDate,
                  today
                );
                return (
                  !mock.emailReminderSent &&
                  daysDiff >= 0 &&
                  daysDiff <= 7
                );
              });

              if (expiringMocks.length === 0) continue;

              const soonestMock = expiringMocks.reduce(
                (min, mock) =>
                  parseISO(mock.mrValidationExpiry) <
                  parseISO(min.mrValidationExpiry)
                    ? mock
                    : min,
                expiringMocks[0]
              );

              const soonestExpiryDate = new Date(
                soonestMock.mrValidationExpiry
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              const subject =
                "Mock Test Booking Validity Expiring Soon";
              const message = `
          <div style="font-family: Arial, sans-serif; color: #000; font-size: 15px; line-height: 1.6;">
            <h2>Mock Test Booking Validity Expiring Soon</h2>
            <p>Dear ${sanitizeHtml(
              user.name || "Candidate"
            )},</p>
            <p>This is a friendly reminder that your <strong>mock test booking</strong> on the Luminedge portal is <strong>about to expire</strong>.</p>
            <p>To avoid any disruption in your preparation:</p>
            <ul>
              <li>Complete your mock test before <strong>${soonestExpiryDate}</strong>.</li>
              <li>Contact us if you need any help.</li>
            </ul>
            ${expiringMocks
              .map((mock, index) => {
                return `
                <p>
                  <strong>Expiry Date:</strong> ${new Date(
                    mock.mrValidationExpiry
                  ).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}<br/>
                  <strong>Mock Test:</strong> ${sanitizeHtml(
                    mock.mockType || "N/A"
                  )} (${sanitizeHtml(
                  mock.testType || "N/A"
                )}) / Purchased Mock ${index + 1}
                </p>
              `;
              })
              .join("")}
            <p>Best regards,<br/><strong>Team Luminedge</strong></p>
            <p style="color: #555;">
              📞 01400-403474 | 01400-403475 | 01400-403486 | 01400-403487 | 01400-403493 | 01400-403494
            </p>
          </div>
        `;

              const result = await emailSender(
                subject,
                user.email,
                message
              );
              await delay(300);

              if (!result.success) {
                console.error(
                  `❌ Failed to send reminder to ${user.email}: ${
                    result.error?.message || result.error
                  }`
                );
                continue;
              }

              console.log(
                `✅ Reminder sent to ${user.email} (${expiringMocks.length} mock(s))`
              );

              const updatedMocks = user.mocks.map((mock) =>
                expiringMocks.some(
                  (m) =>
                    m.transactionId === mock.transactionId
                )
                  ? {
                      ...mock,
                      emailReminderSent: true,
                      updatedAt: new Date(),
                    }
                  : mock
              );

              const updateResult =
                await usersCollection.updateOne(
                  { email: user.email },
                  {
                    $set: {
                      mocks: updatedMocks,
                      updatedAt: new Date(),
                    },
                  }
                );

              if (updateResult.modifiedCount === 0) {
                console.error(
                  `⚠️ Failed to update emailReminderSent for ${user.email}`
                );
              } else {
                console.log(
                  `✅ Updated reminder flag for ${user.email}`
                );
              }
            } catch (userError) {
              console.error(
                `❌ Error processing ${user.email}:`,
                userError.message
              );
            }
          }
        } catch (err) {
          console.error("❌ Cron job error:", err.message, err.stack);
        }
      },
      {
        timezone: "Asia/Dhaka",
      }
    );

    const path = require("path");
    const multer = require("multer");

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const isPDF =
          file.mimetype === "application/pdf" ||
          path.extname(file.originalname).toLowerCase() ===
            ".pdf";
        return isPDF
          ? cb(null, true)
          : cb(new Error("Only PDF files are allowed"));
      },
    });

    app.post("/api/v1/admin/save-feedback", async (req, res) => {
      try {
        const {
          userId,
          scheduleId,
          segment,
          feedback,
          marks,
          admin,
          adminEmail,
        } = req.body;

        if (
          !userId ||
          !scheduleId ||
          !segment ||
          feedback === undefined ||
          !adminEmail
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Missing required fields (userId, scheduleId, segment, feedback, adminEmail).",
          });
        }
        if (!ObjectId.isValid(userId)) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid userId" });
        }

        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (!user)
          return res.status(404).json({
            success: false,
            message: "User not found.",
          });

        const t = user.teachersBySchedule?.[scheduleId] || {};
        const teacherEmailMap = {
          listening: t.teacherLEmail || user.teacherLEmail,
          reading: t.teacherREmail || user.teacherREmail,
          writing: t.teacherWEmail || user.teacherWEmail,
          speaking: t.teacherSEmail || user.teacherSEmail,
        };
        const assignedEmail = (
          teacherEmailMap[segment] || ""
        )
          .trim()
          .toLowerCase();
        const submittingEmail = adminEmail
          .trim()
          .toLowerCase();
        if (!assignedEmail || assignedEmail !== submittingEmail) {
          return res.status(403).json({
            success: false,
            message: `Unauthorized: Only ${
              assignedEmail || "assigned teacher"
            } can save feedback for ${segment}.`,
          });
        }

        if (
          segment === "writing" &&
          (typeof feedback !== "object" ||
            typeof marks !== "object")
        )
          return res.status(400).json({
            success: false,
            message:
              "Invalid format for writing feedback or marks.",
          });
        if (
          segment === "speaking" &&
          (typeof feedback !== "string" ||
            typeof marks !== "object")
        )
          return res.status(400).json({
            success: false,
            message:
              "Invalid format for speaking feedback or marks.",
          });

        if (segment === "speaking" || segment === "writing") {
          if (
            typeof admin !== "string" ||
            !admin.trim()
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Signature is required for this segment.",
            });
          }
        }

        const alreadySaved = !!(
          user.feedbackStatusBySchedule?.[scheduleId]?.[
            segment
          ]
        );
        if (alreadySaved) {
          return res.status(409).json({
            success: false,
            message: `Feedback for ${segment} already saved for this schedule.`,
          });
        }

        const adminValue =
          typeof admin === "string" ? admin.trim() : admin;
        const feedbackEntry = {
          segment,
          feedback,
          marks: marks ?? null,
          admin:
            segment === "speaking" || segment === "writing"
              ? String(adminValue).slice(0, 200)
              : adminValue,
          timestamp: new Date().toISOString(),
        };

        const updateData = {
          $push: {
            [`resultsBySchedule.${scheduleId}`]: feedbackEntry,
          },
          $set: {
            [`feedbackStatusBySchedule.${scheduleId}.${segment}`]:
              true,
          },
        };

        await usersCollection.updateOne(
          { _id: new ObjectId(userId) },
          updateData
        );
        return res
          .status(200)
          .json({ success: true, message: "Feedback saved successfully." });
      } catch (err) {
        console.error("❌ Save feedback error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Server error." });
      }
    });

    app.put("/api/v1/admin/save-admin-section",
      async (req, res) => {
        try {
          const {
            userId,
            scheduleId,
            overall,
            proficiency,
            resultDate,
            schemeCode,
            comments,
            adminSignature,
            centreName,
            testDate,
          } = req.body;

          if (!userId || !scheduleId) {
            return res.status(400).json({
              success: false,
              message: "userId and scheduleId are required",
            });
          }
          if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid userId",
            });
          }

          const section = {
            overallScore: overall ?? null,
            proficiencyLevel: proficiency ?? null,
            resultDate: resultDate ?? null,
            schemeCode: schemeCode ?? null,
            adminComments: comments ?? null,
            adminSignature: adminSignature ?? null,
            centreName: centreName ?? null,
            testDate: testDate ?? null,
            updatedAt: new Date(),
          };

          const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { [`adminSectionBySchedule.${scheduleId}`]: section } }
          );

          if (result.matchedCount === 0) {
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          }

          res.status(200).json({
            success: true,
            message: "Admin section saved successfully",
          });
        } catch (error) {
          console.error("❌ Error saving admin section:", error);
          res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }
      }
    );

    app.get("/api/v1/admin/get-admin-section/:userId/:scheduleId",
      async (req, res) => {
        try {
          const { userId, scheduleId } = req.params;
          if (!ObjectId.isValid(userId))
            return res
              .status(400)
              .json({ success: false, message: "Invalid userId" });

          const user = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });
          if (!user)
            return res.status(404).json({
              success: false,
              message: "User not found",
            });

          const s =
            user.adminSectionBySchedule?.[scheduleId] || {};
          const {
            adminComments = null,
            schemeCode = null,
            resultDate = null,
            adminSignature = null,
            overallScore = null,
            proficiencyLevel = null,
            centreName = null,
            testDate = null,
          } = s;

          res.status(200).json({
            adminComments,
            schemeCode,
            resultDate,
            adminSignature,
            overallScore,
            proficiencyLevel,
            centreName,
            testDate,
          });
        } catch (err) {
          console.error("Error fetching admin section:", err);
          res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }
      }
    );

    app.get("/api/v1/admin/feedback-status/:userId/:scheduleId",
      async (req, res) => {
        try {
          const { userId, scheduleId } = req.params;
          if (!ObjectId.isValid(userId)) {
            return res
              .status(400)
              .json({ success: false, message: "Invalid userId." });
          }

          const user = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });
          if (!user)
            return res.status(404).json({
              success: false,
              message: "User not found.",
            });

          const resultArray =
            user.resultsBySchedule?.[scheduleId] || [];
          const feedbackFlags =
            user.feedbackStatusBySchedule?.[scheduleId] ||
            {};

          let firstName = "",
            lastName = "";
          if (user.name) {
            const parts = user.name.trim().split(/\s+/);
            firstName = parts[0] || "";
            lastName = parts.slice(1).join(" ") || "";
          }

          const dateOfBirth = user.dateofbirth
            ? user.dateofbirth.replace(
                /(\d{2})-(\d{2})-(\d{4})/,
                "$3-$2-$1"
              )
            : "";

          const status = {
            firstName: firstName || "",
            lastName: lastName || "",
            dateOfBirth: dateOfBirth || "",
            testDate:
              user.adminSectionBySchedule?.[scheduleId]
                ?.testDate || "",
            centreName:
              user.adminSectionBySchedule?.[scheduleId]
                ?.centreName || "",
            sex: user.sex || "",
            schemeCode:
              user.adminSectionBySchedule?.[scheduleId]
                ?.schemeCode || "",

            listening: !!feedbackFlags.listening,
            reading: !!feedbackFlags.reading,
            writing: !!feedbackFlags.writing,
            speaking: !!feedbackFlags.speaking,

            listeningFeedback: "",
            readingFeedback: "",
            speakingFeedback: "",
            listeningMarks: "",
            readingMarks: "",
            speakingMarks: "",
            speakingFC: "",
            speakingLR: "",
            speakingGRA: "",
            speakingPRO: "",
            writingScores: {
              task1_overall: "",
              task1_TA: "",
              task1_CC: "",
              task1_LR: "",
              task1_GRA: "",
              task2_overall: "",
              task2_TR: "",
              task2_CC: "",
              task2_LR: "",
              task2_GRA: "",
            },
            writingTask1: [],
            writingTask2: [],
            task1Notes: ["", "", "", "", ""],
            task2Notes: ["", "", "", "", ""],
            writingSign: "",
            speakingSign: "",
            timestamps: {
              listening: "",
              reading: "",
              writing: "",
              speaking: "",
            },
          };

          for (const entry of resultArray) {
            const seg = entry.segment;
            const marks = entry.marks;
            const fb = entry.feedback;
            const ts = entry.timestamp || "";

            if (seg === "listening") {
              status.listeningFeedback = fb || "";
              status.listeningMarks = marks || "";
              status.timestamps.listening = ts;
            } else if (seg === "reading") {
              status.readingFeedback = fb || "";
              status.readingMarks = marks || "";
              status.timestamps.reading = ts;
            } else if (seg === "speaking") {
              status.speakingFeedback = fb || "";
              status.speakingMarks = marks?.Total || "";
              status.speakingFC = marks?.FC || "";
              status.speakingLR = marks?.LR || "";
              status.speakingGRA = marks?.GRA || "";
              status.speakingPRO = marks?.PRO || "";
              status.speakingSign = entry.admin || "";
              status.timestamps.speaking = ts;
            } else if (seg === "writing") {
              status.writingScores =
                marks || status.writingScores;
              status.writingTask1 =
                fb?.writingTask1 || [];
              status.writingTask2 =
                fb?.writingTask2 || [];
              status.task1Notes =
                fb?.task1Notes || ["", "", "", "", ""];
              status.task2Notes =
                fb?.task2Notes || ["", "", "", "", ""];
              status.writingSign = entry.admin || "";
              status.timestamps.writing = ts;
            }
          }

          return res
            .status(200)
            .json({ success: true, status });
        } catch (err) {
          console.error(
            "Feedback status error:",
            err.stack || err
          );
          return res
            .status(500)
            .json({ success: false, message: "Server error." });
        }
      }
    );

    app.put("/api/v1/admin/users/:userId/schedules/:scheduleId/teacher",
      async (req, res) => {
        const { userId, scheduleId } = req.params;
        const { skill, teacher, email } = req.body;

        if (!ObjectId.isValid(userId))
          return res
            .status(400)
            .json({ message: "Invalid user ID." });
        if (!scheduleId)
          return res
            .status(400)
            .json({ message: "scheduleId is required." });
        if (!["L", "W", "R", "S"].includes(skill))
          return res
            .status(400)
            .json({ message: "Invalid skill." });
        if (!teacher || typeof teacher !== "string")
          return res
            .status(400)
            .json({ message: "Invalid teacher value." });
        if (!email || typeof email !== "string")
          return res.status(400).json({
            message: "Teacher email is required.",
          });

        try {
          const updateFields = {
            [`teachersBySchedule.${scheduleId}.teacher${skill}`]:
              teacher,
            [`teachersBySchedule.${scheduleId}.teacher${skill}Email`]:
              email.toLowerCase().trim(),
          };

          const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateFields }
          );

          if (result.matchedCount === 0)
            return res
              .status(404)
              .json({ message: "User not found." });

          return res.status(200).json({
            success: true,
            message: `Teacher for ${skill} updated to ${teacher} (schedule ${scheduleId})`,
          });
        } catch (error) {
          console.error("Error updating teacher:", error);
          return res.status(500).json({
            message: "Server error. Please try again.",
          });
        }
      }
    );

    app.get("/api/v1/admin/assigned-teachers/:userId/:scheduleId",
      async (req, res) => {
        const { userId, scheduleId } = req.params;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            message: "Invalid user ID format",
          });
        }
        if (!scheduleId) {
          return res
            .status(400)
            .json({ message: "scheduleId is required" });
        }

        try {
          const user = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            {
              projection: {
                teachersBySchedule: 1,
                teacherLEmail: 1,
                teacherREmail: 1,
                teacherWEmail: 1,
                teacherSEmail: 1,
              },
            }
          );
          if (!user)
            return res
              .status(404)
              .json({ message: "User not found" });

          const t = user.teachersBySchedule?.[scheduleId] || {};
          return res.json({
            teacherL:
              t.teacherLEmail
                ?.toLowerCase()
                .trim() ||
              user.teacherLEmail
                ?.toLowerCase()
                .trim() ||
              null,
            teacherR:
              t.teacherREmail
                ?.toLowerCase()
                .trim() ||
              user.teacherREmail
                ?.toLowerCase()
                .trim() ||
              null,
            teacherW:
              t.teacherWEmail
                ?.toLowerCase()
                .trim() ||
              user.teacherWEmail
                ?.toLowerCase()
                .trim() ||
              null,
            teacherS:
              t.teacherSEmail
                ?.toLowerCase()
                .trim() ||
              user.teacherSEmail
                ?.toLowerCase()
                .trim() ||
              null,
          });
        } catch (error) {
          console.error(
            "Error fetching assigned teacher emails:",
            error
          );
          return res
            .status(500)
            .json({ message: "Server error" });
        }
      }
    );

    app.put("/api/v1/admin/bookings/:bookingId/teacher",
      async (req, res) => {
        const { bookingId } = req.params;
        const { skill, teacher, email } = req.body;

        if (!ObjectId.isValid(bookingId)) {
          return res
            .status(400)
            .json({ message: "Invalid booking ID." });
        }
        if (!["L", "W", "R", "S"].includes(skill)) {
          return res
            .status(400)
            .json({ message: "Invalid skill parameter" });
        }
        if (!teacher || !email) {
          return res.status(400).json({
            message: "Teacher and email are required",
          });
        }

        let session;

        try {
          session = client.startSession();
          session.startTransaction();

          const booking = await bookingMockCollection.findOne(
            { _id: new ObjectId(bookingId), location: "Home" },
            { session }
          );

          if (!booking) {
            await session.abortTransaction();
            await session.endSession();
            return res
              .status(404)
              .json({ message: "Home booking not found" });
          }

          const userId = booking.userId;

          await usersCollection.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            {
              $set: {
                [`teachersBySchedule.${bookingId}.teacher${skill}`]:
                  teacher,
                [`teachersBySchedule.${bookingId}.teacher${skill}Email`]:
                  email.toLowerCase().trim(),
              },
            },
            { session }
          );

          const updateBookingResult =
            await bookingMockCollection.findOneAndUpdate(
              { _id: new ObjectId(bookingId) },
              {
                $set: {
                  [`teacher${skill}`]: teacher,
                  [`teacher${skill}Email`]:
                    email.toLowerCase().trim(),
                },
              },
              { returnDocument: "after", session }
            );

          await session.commitTransaction();
          await session.endSession();

          return res.status(200).json({
            success: true,
            message: `Teacher for ${skill} updated for home booking`,
            booking: updateBookingResult.value,
          });
        } catch (error) {
          console.error(
            "Error updating teacher assignment:",
            error
          );
          if (session) {
            try {
              await session.abortTransaction();
              await session.endSession();
            } catch (e) {
              console.error(
                "Error cleaning up session:",
                e
              );
            }
          }
          return res
            .status(500)
            .json({ message: "Internal server error" });
        }
      }
    );

    app.get("/api/v1/admin/trf-email-status/:userId/:scheduleId",
      async (req, res) => {
        try {
          const { userId, scheduleId } = req.params;

          if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
              sent: false,
              message: "Invalid user ID",
            });
          }
          if (!scheduleId) {
            return res.status(400).json({
              sent: false,
              message: "scheduleId is required",
            });
          }

          const bookingDoc =
            await bookingMockCollection.findOne(
              { userId, scheduleId },
              { projection: { trfEmailed: 1, trfEmailAt: 1 } }
            );
          if (bookingDoc?.trfEmailed) {
            return res.json({
              sent: true,
              lastSentAt: bookingDoc.trfEmailAt || null,
            });
          }

          if (ObjectId.isValid(scheduleId)) {
            const homeDoc =
              await bookingMockCollection.findOne(
                {
                  _id: new ObjectId(scheduleId),
                  userId,
                  location: "Home",
                },
                {
                  projection: {
                    trfEmailed: 1,
                    trfEmailAt: 1,
                  },
                }
              );
            if (homeDoc?.trfEmailed) {
              return res.json({
                sent: true,
                lastSentAt: homeDoc.trfEmailAt || null,
              });
            }
          }

          const user = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            {
              projection: {
                [`trfEmailsBySchedule.${scheduleId}`]: 1,
              },
            }
          );
          const mirror =
            user?.trfEmailsBySchedule?.[scheduleId];
          if (mirror?.lastSentAt) {
            return res.json({
              sent: true,
              lastSentAt: mirror.lastSentAt,
            });
          }

          return res.json({ sent: false });
        } catch (err) {
          console.error("status route failed:", err);
          return res.status(500).json({
            sent: false,
            message: "Server error",
          });
        }
      }
    );

    app.post("/api/v1/admin/send-trf-email/:userId/:scheduleId",
      upload.single("file"),
      async (req, res) => {
        try {
          const { userId, scheduleId } = req.params;

          if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid user ID",
            });
          }
          if (!scheduleId) {
            return res.status(400).json({
              success: false,
              message: "scheduleId is required",
            });
          }
          if (!req.file || !req.file.buffer) {
            return res.status(400).json({
              success: false,
              message:
                'PDF file is required (field name: "file")',
            });
          }

          const fmtDateLong = (d) =>
            d
              ? new Date(d).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A";
          const toYMD = (v) => {
            if (!v) return "";
            if (v instanceof Date && !isNaN(+v))
              return v.toISOString().slice(0, 10);
            if (typeof v === "number") {
              const d = new Date(v);
              return isNaN(+d)
                ? ""
                : d.toISOString().slice(0, 10);
            }
            if (typeof v === "string") {
              const s = v.trim();
              if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
              if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
                const [dd, mm, yyyy] = s.split("-");
                return `${yyyy}-${mm}-${dd}`;
              }
              const d = new Date(s);
              if (!isNaN(+d))
                return d.toISOString().slice(0, 10);
            }
            if (v && typeof v === "object") {
              const o = v;
              if (o.$date) {
                const d = new Date(o.$date);
                return isNaN(+d)
                  ? ""
                  : d.toISOString().slice(0, 10);
              }
              if (typeof o.seconds === "number") {
                const d = new Date(o.seconds * 1000);
                return isNaN(+d)
                  ? ""
                  : d.toISOString().slice(0, 10);
              }
              if (typeof o.toDate === "function") {
                const d = o.toDate();
                if (d instanceof Date && !isNaN(+d))
                  return d.toISOString().slice(0, 10);
              }
            }
            return "";
          };

          const user = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            {
              projection: {
                email: 1,
                name: 1,
                adminSectionBySchedule: 1,
                dateOfBirth: 1,
                dateofbirth: 1,
                sex: 1,
              },
            }
          );
          if (!user) {
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          }

          let booking = null;
          let isHomeBooking = false;

          if (ObjectId.isValid(scheduleId)) {
            const home =
              await bookingMockCollection.findOne({
                _id: new ObjectId(scheduleId),
                userId,
                location: "Home",
              });
            if (home) {
              booking = home;
              isHomeBooking = true;
            }
          }

          if (!booking) {
            booking =
              (await bookingMockCollection.findOne({
                userId,
                scheduleId,
              })) ||
              (await bookingMockCollection
                .find({ userId })
                .sort({ bookingDate: -1, _id: -1 })
                .limit(1)
                .next());
          }

          const sect =
            user.adminSectionBySchedule?.[scheduleId] || {};

          const testDate = booking?.bookingDate
            ? fmtDateLong(booking.bookingDate)
            : fmtDateLong(sect.testDate);
          const headlineDate =
            testDate !== "N/A" ? testDate : "[Test Date]";
          const studentName = (user.name || "Student").trim();

          const dobYMD =
            toYMD(
              user.dateOfBirth ||
                user.dateofbirth ||
                sect.dateOfBirth
            ) || "YYYY-MM-DD";
          let sex = (user.sex || sect.sex || "")
            .toString()
            .trim()
            .toUpperCase();
          sex = sex === "M" || sex === "F" ? sex : "M/F";

          const subject =
            req.body.subject ||
            `Your Mock Test Result – ${headlineDate}`;
          const letterHTML = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;padding:0;background:#ffffff;">
    <div dir="ltr" style="margin:0;padding:0;color:#000;font:16px/1.6 Arial,Helvetica,sans-serif;text-align:left;">
      <div style="font-size:28px;font-weight:700;margin:0 0 16px 0;">
        Your Mock Test Result – ${headlineDate}
      </div>
      <div style="margin:0 0 12px 0;">Dear ${studentName},</div>
      <div style="margin:0 0 12px 0;">
        Your <strong>Luminedge Mock Test</strong> result for <strong>${headlineDate}</strong> has been
        published. Please find your <strong>Test Report Form (TRF)</strong> attached with this email.
      </div>
      <div style="margin:0 0 12px 0;">
        We encourage you to review the feedback carefully and plan your next steps. To achieve your
        target score, consider enrolling in our
        <a href="https://luminedge.com.bd/ielts" target="_blank" rel="noopener noreferrer"
           style="color:#1a73e8;text-decoration:underline;">Crash or Premium Courses</a>,
        designed to maximize your performance before the real exam.
      </div>
      <div style="margin:0 0 12px 0;">
        You may also book your upcoming mocks through the Luminedge portal.
      </div>
      <div style="margin:18px 0 4px 0;">Best regards,</div>
      <div style="margin:0;font-weight:700;">Team Luminedge</div>
    </div>
  </body>
</html>`.trim();

          const original =
            (req.file.originalname || "").trim();
          const filename = /\.pdf$/i.test(original)
            ? original
            : `IELTS_TRF_${(studentName || "Candidate")
                .replace(/\s+/g, "_")
                .toString()}_${scheduleId}.pdf`;

          const result = await emailSender(
            subject,
            user.email,
            req.body.message || letterHTML,
            [
              {
                filename,
                content: req.file.buffer,
                contentType:
                  req.file.mimetype || "application/pdf",
                contentDisposition: "attachment",
              },
            ]
          );

          if (!result?.success) {
            return res.status(502).json({
              success: false,
              message: "Failed to send TRF email",
              error:
                result?.error?.message || "Unknown error",
            });
          }

          const now = new Date();

          if (isHomeBooking && booking?._id) {
            await bookingMockCollection.updateOne(
              { _id: booking._id },
              { $set: { trfEmailed: true, trfEmailAt: now } }
            );
          } else {
            await bookingMockCollection.updateOne(
              { userId, scheduleId },
              { $set: { trfEmailed: true, trfEmailAt: now } },
              { upsert: false }
            );
          }

          const mirrorPath = `trfEmailsBySchedule.${scheduleId}`;
          await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
              $set: {
                [`${mirrorPath}.lastSentAt`]: now,
                [`${mirrorPath}.lastSubject`]: subject,
                [`${mirrorPath}.lastFilename`]: filename,
                [`${mirrorPath}.to`]: user.email,
                lastTrfEmailAt: now,
              },
              $push: {
                [`${mirrorPath}.history`]: {
                  at: now,
                  subject,
                  filename,
                  to: user.email,
                },
              },
            }
          );

          return res.json({
            success: true,
            message: `TRF sent to ${user.email}`,
            to: user.email,
            subject,
            filename,
            defaultsUsed: { dateOfBirth: dobYMD, sex },
            lastSentAt: now,
          });
        } catch (err) {
          console.error("Error sending TRF email:", err);
          return res.status(500).json({
            success: false,
            message: "Server error",
          });
        }
      }
    );

    app.get("/api/v1/admin/bookings",
      async (req, res, next) => {
        try {
          const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
          );
          const limit = Math.min(
            2000,
            Math.max(
              1,
              parseInt(req.query.limit, 10) || 500
            )
          );
          const skip = (page - 1) * limit;

          const q = {};
          if (req.query.location)
            q.location = String(req.query.location);
          if (req.query.status)
            q.status = String(req.query.status);

          const bookings = await bookingMockCollection
            .find(q, { projection: {} })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .maxTimeMS(9000)
            .toArray();

          if (bookings.length === 0 && page === 1) {
            return res
              .status(404)
              .json({ message: "No bookings found" });
          }
          res.json({ bookings });
        } catch (err) {
          if (err?.code === 50) {
            return res.status(504).json({
              message:
                "Query took too long. Try a smaller page/limit.",
            });
          }
          next(err);
        }
      }
    );

    app.get("/api/v1/admin/bookings/by-schedule/:scheduleId",
      async (req, res, next) => {
        try {
          const scheduleId = String(
            req.params.scheduleId || ""
          );
          if (!scheduleId)
            return res
              .status(400)
              .json({ message: "scheduleId is required" });

          const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
          );
          const limit = Math.min(
            2000,
            Math.max(
              1,
              parseInt(req.query.limit, 10) || 500
            )
          );
          const skip = (page - 1) * limit;

          const projection = {
            _id: 1,
            id: 1,
            name: 1,
            testType: 1,
            testSystem: 1,
            bookingDate: 1,
            scheduleId: 1,
            slotId: 1,
            startTime: 1,
            endTime: 1,
            userId: 1,
            userCount: 1,
            attendance: 1,
          };

          const cursor = bookingMockCollection
            .find({ scheduleId }, { projection })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .maxTimeMS(8000);

          const bookings = await cursor.toArray();
          return res.json({ bookings, page, limit });
        } catch (err) {
          if (err?.code === 50) {
            return res.status(504).json({
              message:
                "Query took too long for this page/limit.",
            });
          }
          next(err);
        }
      }
    );

    app.post("/api/v1/user/attendance/bulk", async (req, res) => {
      try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds)) {
          return res
            .status(400)
            .json({ error: "Invalid userIds format" });
        }

        const attendanceData =
          await bookingMockCollection
            .aggregate([
              {
                $match: {
                  userId: { $in: userIds },
                  attendance: { $in: ["present", "absent"] },
                },
              },
              {
                $group: {
                  _id: "$userId",
                  count: { $sum: 1 },
                },
              },
            ])
            .toArray();

        const attendanceMap = attendanceData.reduce(
          (acc, item) => {
            acc[item._id] = item.count;
            return acc;
          },
          {}
        );

        res.json({ attendance: attendanceMap });
      } catch (error) {
        console.error(
          "Error fetching bulk attendance:",
          error
        );
        res
          .status(500)
          .json({ error: "Internal server error" });
      }
    });

    app.get("/api/v1/user/bookings/:userId", async (req, res) => {
      const { userId } = req.params;

      const bookings = await bookingMockCollection
        .find({ userId: userId })
        .toArray();

      res.json({ bookings });
    });

    app.get("/api/v1/admin/bookings/home-with-users",
      async (req, res) => {
        try {
          const homeBookingsWithUsers =
            await bookingMockCollection
              .aggregate([
                {
                  $match: { location: "Home" },
                },
                {
                  $addFields: {
                    userObjectId: {
                      $toObjectId: "$userId",
                    },
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "userObjectId",
                    foreignField: "_id",
                    as: "user",
                  },
                },
                { $unwind: "$user" },
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    testType: 1,
                    testSystem: 1,
                    location: 1,
                    bookingDate: 1,
                    testTime: 1,
                    attendance: 1,
                    userId: 1,
                    "user._id": 1,
                    "user.name": 1,
                    "user.email": 1,
                    "user.contactNo": 1,
                    "user.transactionId": 1,
                    "user.mock": 1,
                    "user.totalMock": 1,
                    "user.status": 1,
                    "user.passportNumber": 1,
                  },
                },
              ])
              .toArray();

          res.json({ bookings: homeBookingsWithUsers });
        } catch (error) {
          console.error(
            "Error fetching optimized home bookings:",
            error
          );
          res.status(500).json({
            message: "Internal Server Error",
          });
        }
      }
    );

    app.put("/api/v1/user/bookings/:scheduleId",
      async (req, res) => {
        try {
          const { scheduleId } = req.params;
          const { userId, attendance, status, bookingDate } =
            req.body;

          if (!userId || !attendance || !status) {
            console.error("❌ Missing required fields:", {
              userId,
              attendance,
              status,
              bookingDate,
            });
            return res
              .status(400)
              .json({ message: "Missing required fields." });
          }

          let updateFilter = {};
          let schedule = null;
          let testDateFormatted;

          if (scheduleId.toLowerCase() === "home") {
            if (!bookingDate) {
              return res.status(400).json({
                message:
                  "Booking date is required for Home bookings.",
              });
            }

            const bookingDateParsed = new Date(bookingDate);
            if (isNaN(bookingDateParsed.getTime())) {
              console.error(
                "❌ Invalid bookingDate format:",
                bookingDate
              );
              return res.status(400).json({
                message: "Invalid booking date format.",
              });
            }

            updateFilter = {
              userId,
              location: "Home",
              bookingDate,
            };
            testDateFormatted =
              bookingDateParsed.toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              );

            console.log(
              "🔍 Searching for Home booking with:",
              updateFilter
            );
          } else {
            if (!ObjectId.isValid(scheduleId)) {
              console.error(
                "❌ Invalid schedule ID format:",
                scheduleId
              );
              return res.status(400).json({
                message: "Invalid schedule ID format.",
              });
            }

            updateFilter = { scheduleId, userId };

            schedule = await schedulesCollection.findOne({
              _id: new ObjectId(scheduleId),
            });
            if (!schedule) {
              return res
                .status(404)
                .json({ message: "Schedule not found" });
            }

            testDateFormatted = new Date(
              schedule.startDate
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            console.log(
              "🔍 Searching for Test Center booking with:",
              updateFilter
            );
          }

          const existingBooking =
            await bookingMockCollection.findOne(
              updateFilter
            );
          if (!existingBooking) {
            console.error(
              "❌ Booking not found for update:",
              updateFilter
            );
            return res
              .status(404)
              .json({ message: "Booking not found." });
          }

          const updateResult =
            await bookingMockCollection.updateOne(
              updateFilter,
              {
                $set: { status, attendance },
              }
            );

          if (updateResult.matchedCount === 0) {
            console.error(
              "❌ No matching booking found:",
              updateFilter
            );
            return res
              .status(404)
              .json({ message: "Booking not found." });
          }

          if (updateResult.modifiedCount === 0) {
            console.warn(
              "⚠️ Booking found but attendance was not modified:",
              updateFilter
            );
            return res
              .status(200)
              .json({ message: "Attendance already updated." });
          }

          console.log(
            "✅ Attendance updated successfully for:",
            updateFilter
          );

          const user = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });
          if (!user) {
            console.error(
              "❌ User not found for email notification."
            );
            return res
              .status(404)
              .json({ message: "User not found." });
          }

          let subject, messageContent;

          if (attendance === "present") {
            subject =
              "Thank You for Participating in Your Mock Test";
            messageContent = `
          <div>
            <p>Dear ${user.name || "Student"},</p>
            <p>Thank you for attending your mock test on <strong>${testDateFormatted}</strong> at Luminedge! We hope the experience was helpful in assessing your preparation.</p>
            <p>Here are a few next steps to make the most of your mock test:</p>
            <ul>
              <li>Review your performance and identify improvement areas.</li>
              <li>Reach out to us if you need additional resources or support to enhance your preparation.</li>
            </ul>
            <p>Your insights help us improve our services. If you have any feedback about the test experience, feel free to share it with us at:</p>
            <p>📞 01400-406374 | 01400-403475 | 01400-403486 | 01400-403487 | 01400-403493 | 01400-403494</p>
            <p>We wish you the best of luck as you continue your journey toward success!</p>
            <p>Best regards,</p>
            <p>The Luminedge Team</p>
          </div>
        `;
          } else if (attendance === "absent") {
            subject = "We Missed You at Your Mock Test";
            messageContent = `
          <div>
            <p>Dear ${user.name || "Student"},</p>
            <p>We noticed that you couldn't attend your mock test scheduled on <strong>${testDateFormatted}</strong> at Luminedge! We understand that unexpected situations can arise, and we genuinely care about your preparation journey.</p>
            <p>Here are a few options to help you get back on track:</p>
            <ul>
              <li>Consider purchasing additional mock tests to continue your preparation journey.</li>
              <li>Reach out to our expert instructors for personalized guidance and strategies to enhance your test readiness.</li>
            </ul>
            <p>We’re here to support you in achieving your goals. If you need assistance or have any questions, feel free to contact us at:</p>
            <p>📞 01400-406374 | 01400-403475 | 01400-403486 | 01400-403487 | 01400-403493 | 01400-403494</p>
            <p>Your success is our priority, and we’re committed to helping you every step of the way!</p>
            <p>Best regards,</p>
            <p>The Luminedge Team</p>
          </div>
        `;
          }

          try {
            await emailSender(subject, user.email, messageContent);
            console.log(
              `📩 Attendance email sent successfully to ${user.email}`
            );
          } catch (emailError) {
            console.error(
              "❌ Error sending attendance email:",
              emailError
            );
          }

          res.json({
            success: true,
            message: `Attendance updated successfully for ${
              scheduleId.toLowerCase() === "home"
                ? "Home"
                : "Test Center"
            } booking.`,
          });
        } catch (error) {
          console.error("❌ Error updating attendance:", error);
          res.status(500).json({
            message: "Error updating attendance",
            error: error.message,
          });
        }
      }
    );

    app.delete("/api/v1/bookings/:bookingId", async (req, res) => {
      const { bookingId } = req.params;

      try {
        const session = client.startSession();
        session.startTransaction();

        const existingBooking =
          await bookingMockCollection.findOne({
            _id: new ObjectId(bookingId),
          });
        if (!existingBooking) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(404)
            .json({ message: "Booking not found." });
        }

        const deleteResult =
          await bookingMockCollection.deleteOne(
            { _id: new ObjectId(bookingId) },
            { session }
          );

        if (deleteResult.deletedCount === 0) {
          await session.abortTransaction();
          session.endSession();
          return res
            .status(500)
            .json({ message: "Failed to cancel booking." });
        }

        if (
          existingBooking.location === "Test Center" &&
          existingBooking.scheduleId &&
          existingBooking.slotId
        ) {
          await schedulesCollection.updateOne(
            {
              _id: new ObjectId(existingBooking.scheduleId),
              "timeSlots.slotId": existingBooking.slotId,
            },
            { $inc: { "timeSlots.$.slot": 1 } },
            { session }
          );
        }

        if (deleteResult.deletedCount > 0) {
          const userUpdate = await usersCollection.updateOne(
            { _id: new ObjectId(existingBooking.userId) },
            { $inc: { mock: 1 } },
            { session }
          );

          if (userUpdate.modifiedCount === 0) {
            console.warn(
              `Warning: User mock count update failed for userId ${existingBooking.userId}`
            );
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({
              message: "Failed to update mock count.",
            });
          }
        }

        await session.commitTransaction();
        session.endSession();

        res.json({
          success: true,
          message:
            "Booking canceled successfully, and mock count decreased",
        });
      } catch (error) {
        console.error("Error canceling booking:", error);
        res.status(500).json({
          message: "Internal server error",
          error,
        });
      }
    });

    app.get("/api/v1/user/status/:userId", async (req, res) => {
      const { userId } = req.params;
      const user = await usersCollection.findOne({
        _id: new ObjectId(userId),
      });
      res.json({ user });
    });

    app.post("/api/v1/register", async (req, res) => {
      const {
        name,
        email,
        password,
        contactNo,
        mock,
        result,
        passportNumber,
        role,
        transactionId,
        sex,
        dateOfBirth,
      } = req.body;

      const normalizedEmail = email.toLowerCase();

      try {
        const existingUser = await usersCollection.findOne({
          email: normalizedEmail,
        });
        if (existingUser) {
          return res
            .status(400)
            .json({ message: "User already exists" });
        }

        const existingUserByTransactionId =
          await usersCollection.findOne({
            transactionId,
          });
        if (existingUserByTransactionId) {
          return res.status(409).json({
            message: "Transaction ID is already in use.",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
          _id: new ObjectId(),
          name,
          email: normalizedEmail,
          contactNo,
          passportNumber,
          sex,
          dateOfBirth,
          password: hashedPassword,
          mock: 0,
          totalMock: 0,
          result,
          transactionId,
          role: role || "user",
          status: "active",
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await usersCollection.insertOne(newUser);

        const subject = "Welcome to Luminedge!";
        const messageContent = `
      <div>
        <p>Dear ${name},</p>
        <p>Thank you for registering on the Luminedge Mock Booking Portal. Your account has been successfully created!</p>
        <p>Our team will now verify your proof of payment (Money Receipt) details. Once verified, you will be granted access to book your mock tests directly through the portal.</p>
        <p>If any additional information is required, we will contact you promptly. Please allow up to 48 hours for the verification process.</p>
        <p>For any urgent queries, feel free to reach out to us at 📞 01400-406374 | 01400-403475 | 01400-403486 | 01400-403487 | 01400-403493 | 01400-403494.</p>
        <p>Thank you for choosing Luminedge, and we wish you the best in your test preparation journey!</p>
        <p>Best regards,</p>
        <p>The Luminedge Team</p>
      </div>
    `;

        console.log(
          "Sending welcome email to user:",
          normalizedEmail
        );
        console.log("Email content:", messageContent);

        await emailSender(
          subject,
          normalizedEmail,
          messageContent
        );

        res.status(201).json({
          message: "User registered successfully",
          userId: newUser._id,
        });
      } catch (error) {
        console.error(
          "Error during registration process:",
          error
        );
        res
          .status(500)
          .json({ message: "Internal server error" });
      }
    });

   app.get("/api/v1/admin/users", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const reqLimit = parseInt(req.query.limit, 10) || 0;

    // --------- build filters ---------
    const q = {};

    if (req.query.status) {
      q.status = String(req.query.status);
    }

    if (req.query.role) {
      q.role = String(req.query.role);
    }

    const searchRaw = (req.query.search || "").toString().trim();
    if (searchRaw) {
      const s = searchRaw.toLowerCase();
      const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const starts = new RegExp("^" + esc);
      const contains = new RegExp(esc, "i");

      q.$or = [
        { nameLower: { $regex: starts } },
        { emailLower: { $regex: starts } },
        { passportNumberLower: { $regex: contains } },
        { transactionIdLower: { $regex: contains } },
        { name: { $regex: new RegExp("^" + esc, "i") } },
        { email: { $regex: new RegExp("^" + esc, "i") } },
        { passportNumber: { $regex: contains } },
        { transactionId: { $regex: contains } },
      ];
    }

    const projection = {
      password: 0,
      resultsBySchedule: 0,
      feedbackStatusBySchedule: 0,
      adminSectionBySchedule: 0,
      trfEmailsBySchedule: 0,
      mocks: 0,
    };

    // =====================================================
    // 1) Try BULK MODE for dashboard:
    //    page=1 & limit>=1000 (your dashboard call)
    //    BUT only if total <= BULK_MAX.
    // =====================================================
    const wantsAll = page === 1 && reqLimit >= 1000;
    const BULK_MAX = 10_000; // safety cap for free tier / future growth

    let total;

    if (wantsAll && !searchRaw) {
      // Count once
      total = await usersCollection.countDocuments(q, { maxTimeMS: 3000 });

      if (total <= BULK_MAX) {
        // Safe to return everything in one go
        const users = await usersCollection
          .find(q, { projection })
          .sort({ _id: -1 })
          .toArray();

        // total === users.length here, but we keep the explicit count
        return res.json({ users, total });
      }

      // If total > BULK_MAX, we just fall through to paginated logic below.
      // Your frontend `while (acc.length < total)` will keep paging as usual.
    }

    // =====================================================
    // 2) Normal paginated mode (fallback + all other callers)
    //    Single cap for dev & prod.
    // =====================================================
    const cap = 500; // was: isProd ? 120 : 500
    const limit = Math.min(cap, Math.max(1, reqLimit || cap));
    const skip = (page - 1) * limit;

    // Only count when we don't already have total and there's no search
    if (!searchRaw && typeof total !== "number") {
      total = await usersCollection.countDocuments(q, { maxTimeMS: 3000 });
    }

    const users = await usersCollection
      .find(q, { projection })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .maxTimeMS(4000)
      .toArray();

    return res.json({ users, total });
  } catch (err) {
    if (err?.code === 50) {
      // MongoDB maxTimeMS exceeded
      return res.status(504).json({
        message: "Query timed out. Try a smaller page/limit.",
      });
    }
    next(err);
  }
});

    app.get("/api/v1/admin/stats/users/mock-types/range",
      async (req, res, next) => {
        try {
          const { from, to, role = "user" } = req.query;

          const match = { role };

          if (from || to) {
            const tzOffset = "+06:00";
            match.createdAt = {};
            if (from) {
              match.createdAt.$gte = new Date(
                `${from}T00:00:00${tzOffset}`
              );
            }
            if (to) {
              match.createdAt.$lte = new Date(
                `${to}T23:59:59.999${tzOffset}`
              );
            }
          }

          const totalUsers =
            await usersCollection.countDocuments(match);

          const pipeline = [
            { $match: match },
            {
              $project: {
                mocks: 1,
                mockType: 1,
              },
            },
            {
              $addFields: {
                mockTypes: {
                  $cond: [
                    {
                      $gt: [
                        {
                          $size: {
                            $ifNull: ["$mocks", []],
                          },
                        },
                        0,
                      ],
                    },
                    "$mocks.mockType",
                    {
                      $cond: [
                        {
                          $ifNull: ["$mockType", false],
                        },
                        ["$mockType"],
                        [],
                      ],
                    },
                  ],
                },
              },
            },
            { $unwind: "$mockTypes" },
            {
              $group: {
                _id: "$mockTypes",
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                mockType: "$_id",
                count: 1,
              },
            },
            { $sort: { mockType: 1 } },
          ];

          const byMockType = await usersCollection
            .aggregate(pipeline, { maxTimeMS: 5000 })
            .toArray();

          res.json({
            success: true,
            from: from || null,
            to: to || null,
            totalUsers,
            byMockType,
          });
        } catch (err) {
          console.error(
            "Error in /admin/stats/users/mock-types/range",
            err
          );
          next(err);
        }
      }
    );

    app.get("/api/v1/admin/stats/users/mock-types/monthly",
      async (req, res, next) => {
        try {
          const { from, to, role = "user" } = req.query;

          const match = { role };

          if (from || to) {
            const tzOffset = "+06:00";
            match.createdAt = {};
            if (from) {
              match.createdAt.$gte = new Date(
                `${from}T00:00:00${tzOffset}`
              );
            }
            if (to) {
              match.createdAt.$lte = new Date(
                `${to}T23:59:59.999${tzOffset}`
              );
            }
          }

          const pipeline = [
            { $match: match },
            {
              $project: {
                createdAt: 1,
                mocks: 1,
                mockType: 1,
              },
            },
            {
              $addFields: {
                mockTypes: {
                  $cond: [
                    {
                      $gt: [
                        {
                          $size: {
                            $ifNull: ["$mocks", []],
                          },
                        },
                        0,
                      ],
                    },
                    "$mocks.mockType",
                    {
                      $cond: [
                        {
                          $ifNull: ["$mockType", false],
                        },
                        ["$mockType"],
                        [],
                      ],
                    },
                  ],
                },
              },
            },
            { $unwind: "$mockTypes" },
            {
              $group: {
                _id: {
                  month: {
                    $dateToString: {
                      format: "%Y-%m",
                      date: "$createdAt",
                      timezone: "Asia/Dhaka",
                    },
                  },
                  mockType: "$mockTypes",
                },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: "$_id.month",
                byMockType: {
                  $push: {
                    mockType: "$_id.mockType",
                    count: "$count",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                month: "$_id",
                byMockType: 1,
              },
            },
            { $sort: { month: 1 } },
          ];

          const monthly = await usersCollection
            .aggregate(pipeline, { maxTimeMS: 5000 })
            .toArray();

          res.json({
            success: true,
            from: from || null,
            to: to || null,
            monthly,
          });
        } catch (err) {
          console.error(
            "Error in /admin/stats/users/mock-types/monthly",
            err
          );
          next(err);
        }
      }
    );

    app.get("/api/v1/admin/stats/bookings/attendance",
      async (req, res) => {
        try {
          const attendanceTotals =
            await bookingMockCollection
              .aggregate([
                {
                  $group: {
                    _id: {
                      $ifNull: ["$attendance", "not updated"],
                    },
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    status: "$_id",
                    count: 1,
                  },
                },
                { $sort: { status: 1 } },
              ])
              .toArray();

          const uniqueUserDocs =
            await bookingMockCollection
              .aggregate([
                { $group: { _id: "$userId" } },
                { $count: "uniqueUserCount" },
              ])
              .toArray();

          const uniqueUserCount =
            (uniqueUserDocs[0] &&
              uniqueUserDocs[0].uniqueUserCount) ||
            0;

          const monthlyByCourseStatus =
            await bookingMockCollection
              .aggregate([
                {
                  $match: {
                    bookingDate: { $type: "string" },
                  },
                },
                {
                  $addFields: {
                    month: {
                      $substr: ["$bookingDate", 0, 7],
                    },
                    course: {
                      $ifNull: ["$testType", "Unknown"],
                    },
                    status: {
                      $ifNull: ["$attendance", "not updated"],
                    },
                  },
                },
                {
                  $group: {
                    _id: {
                      month: "$month",
                      course: "$course",
                      status: "$status",
                    },
                    count: { $sum: 1 },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    month: "$_id.month",
                    course: "$_id.course",
                    status: "$_id.status",
                    count: 1,
                  },
                },
                {
                  $sort: {
                    month: 1,
                    course: 1,
                    status: 1,
                  },
                },
              ])
              .toArray();

          return res.json({
            attendanceTotals,
            uniqueUserCount,
            monthlyByCourseStatus,
          });
        } catch (err) {
          console.error(
            "Error in /api/v1/admin/stats/bookings/attendance",
            err
          );
          return res.status(500).json({
            message:
              "Failed to load booking attendance stats",
          });
        }
      }
    );

    app.get("/api/v1/admin/user-budget/:userId/:scheduleId",
      async (req, res) => {
        try {
          const { userId, scheduleId } = req.params;
          const objectId = new ObjectId(userId);

          const user = await usersCollection.findOne(
            { _id: objectId },
            { projection: { budget: 1 } }
          );

          if (!user) {
            return res
              .status(404)
              .json({ message: "User not found" });
          }

          const budget =
            user.budget?.[scheduleId] || user.budget || 0;

          res.json({ budget });
        } catch (err) {
          console.error("Error fetching budget:", err);
          res.status(500).json({
            message: "Internal server error",
          });
        }
      }
    );

    app.put("/api/v1/user/update-multiple/:userId",
      async (req, res) => {
        const { userId } = req.params;
        const { mocks } = req.body;

        try {
          if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid user ID",
            });
          }

          if (!Array.isArray(mocks) || mocks.length === 0) {
            return res.status(400).json({
              success: false,
              message:
                "Mocks must be a non-empty array",
            });
          }

          const user = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });
          if (!user) {
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          }

          const userMocks = Array.isArray(user.mocks)
            ? user.mocks
            : [];

          const uniqueMocks = mocks.filter(
            (mock) =>
              !userMocks.some(
                (existing) =>
                  existing.transactionId === mock.transactionId
              )
          );

          if (uniqueMocks.length === 0) {
            return res.status(400).json({
              success: false,
              message: "All transaction IDs are duplicates",
            });
          }

          const entriesToAdd = uniqueMocks.map((entry) => ({
            ...entry,
            mock: Number(entry.mock),
            createdAt: new Date(),
          }));

          const totalMockToAdd = entriesToAdd.reduce(
            (sum, e) => sum + (e.mock || 0),
            0
          );

          const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
              $push: { mocks: { $each: entriesToAdd } },
              $inc: {
                totalMock: totalMockToAdd,
                mock: totalMockToAdd,
              },
            }
          );

          if (result.modifiedCount === 0) {
            return res.status(500).json({
              success: false,
              message: "Failed to update user mocks",
            });
          }

          const emailHTML = `
    <h2>Dear ${user.name},</h2>
    <p>
      We are pleased to inform you that your mock test records have been successfully updated in our system.
      Please find your latest mock test details below:
    </p>
  
    ${entriesToAdd
      .map(
        (mock, i) => `
        <p>📝 <strong>Mock Test ${i + 1}</strong></p>
        <ul>
          <li><strong>Test Type:</strong> ${mock.mockType}</li>
          <li><strong>Mode:</strong> ${mock.testType}</li>
          ${
            mock.testSystem
              ? `<li><strong>Test System:</strong> ${mock.testSystem}</li>`
              : ""
          }
          <li><strong>Total Number of Mocks Added:</strong> ${mock.mock}</li>
          <li><strong>Updated Money Receipt (MR) Number:</strong> ${mock.transactionId}</li>
          <li><strong>Service Validity:</strong> ${mock.mrValidation}</li>
        </ul>
        <br/>
      `
      )
      .join("")}
  
    <p>If you have any questions or need further assistance, please don’t hesitate to reach out to our support team.</p>
  
    <p>
      📞 <strong>01400-403474</strong> | <strong>01400-403475</strong> | 
      <strong>01400-403486</strong> | <strong>01400-403487</strong> |
      <strong>01400-403493</strong> | <strong>01400-403494</strong>
    </p>
  
    <p>
      Thank you for choosing <strong>Luminedge</strong>.<br/>
      We’re committed to supporting your journey to success.
    </p>
  
    <p>Best regards,<br/><strong>The Luminedge Team</strong></p>
  `;

          await emailSender(
            "Email for Mock Test Details Update",
            user.email,
            emailHTML
          );

          res.json({
            success: true,
            message: "Mocks added and email sent",
            addedMocks: entriesToAdd,
          });
        } catch (error) {
          console.error(
            "Error during bulk update or sending email:",
            error
          );
          res
            .status(500)
            .json({ success: false, message: "Server error" });
        }
      }
    );

    app.put("/api/v1/user/update-one/:userId",
      async (req, res) => {
        const { userId } = req.params;
        const { updatedMock, transactionId } = req.body;

        const getFutureISODate = (duration) => {
          const [valueStr, unit] = duration.split(" ");
          const value = parseInt(valueStr);
          if (!value || !unit)
            return new Date().toISOString();

          const now = new Date();
          switch (unit.toLowerCase()) {
            case "minute":
            case "minutes":
              now.setMinutes(now.getMinutes() + value);
              break;
            case "day":
            case "days":
              now.setDate(now.getDate() + value);
              break;
            case "month":
            case "months":
              now.setMonth(now.getMonth() + value);
              break;
            default:
              return new Date().toISOString();
          }

          return now.toISOString();
        };

        try {
          if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid user ID",
            });
          }

          if (!updatedMock || !transactionId) {
            return res.status(400).json({
              success: false,
              message:
                "Missing updated mock data or transaction ID",
            });
          }

          const user = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });

          if (!user || !Array.isArray(user.mocks)) {
            return res.status(404).json({
              success: false,
              message: "User or mocks not found",
            });
          }

          const mockIndex = user.mocks.findIndex(
            (mock) =>
              String(mock.transactionId).trim() ===
              String(transactionId).trim()
          );

          if (mockIndex === -1) {
            return res.status(404).json({
              success: false,
              message:
                "Mock with given transaction ID not found",
            });
          }

          const prevMock = user.mocks[mockIndex];
          const prevMockValue = Number(prevMock.mock) || 0;
          const newMockValue = Number(updatedMock.mock) || 0;
          const deltaMock = newMockValue - prevMockValue;

          const currentTotalMock = user.totalMock || 0;
          const newTotalMock =
            currentTotalMock + deltaMock;

          if (newTotalMock < 0) {
            return res.status(400).json({
              success: false,
              message:
                "Total mock count cannot go below zero",
            });
          }

          const updatedMockData = {
            ...prevMock,
            ...updatedMock,
            mock: newMockValue,
            updatedAt: new Date(),
            mrValidationExpiry: getFutureISODate(
              updatedMock.mrValidation
            ),
          };

          const updatedMocks = [...user.mocks];
          updatedMocks[mockIndex] = updatedMockData;

          const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
              $set: { mocks: updatedMocks },
              $inc: {
                totalMock: deltaMock,
                mock: deltaMock,
              },
            }
          );

          if (result.modifiedCount === 0) {
            return res.status(500).json({
              success: false,
              message: "Mock update failed",
            });
          }

          res.json({
            success: true,
            message: "Mock updated successfully",
            updatedMock: updatedMockData,
          });
        } catch (error) {
          console.error("❌ Error updating single mock:", error);
          res
            .status(500)
            .json({ success: false, message: "Server error" });
        }
      }
    );

    app.get("/api/v1/user/:userId", async (req, res) => {
      const { userId } = req.params;

      try {
        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const mocks = Array.isArray(user.mocks)
          ? user.mocks
          : [];
        const lastMock =
          mocks.length > 0 ? mocks[mocks.length - 1] : null;

        const responseData = {
          success: true,
          user: {
            name: user.name ?? "Unknown User",
            email: user.email ?? "No Email",
            totalMock: user.totalMock ?? 0,
            mock: user.mock ?? 0,
            transactionId:
              lastMock?.transactionId ||
              user.transactionId ||
              "N/A",
            mockType:
              lastMock?.mockType ||
              user.mockType ||
              "N/A",
            testSystem:
              lastMock?.testSystem ||
              user.testSystem ||
              "N/A",
            testType:
              lastMock?.testType ||
              user.testType ||
              "N/A",
            mrValidation:
              lastMock?.mrValidation ||
              user.mrValidation ||
              "N/A",
            status: user.status ?? "N/A",
          },
          mocks,
          lastMock,
        };

        res.json(responseData);
      } catch (error) {
        console.error(
          "Error fetching user mock data:",
          error
        );
        res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
    });

    app.post("/api/v1/login",
      async (req, res, next) => {
        try {
          const { email, password } = req.body;

          const user = await usersCollection.findOne({
            email,
          });
          if (
            !user ||
            !(await bcrypt.compare(password, user.password))
          ) {
            return res.status(401).json({
              message: "Invalid email or password",
            });
          }

          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
              role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.EXPIRES_IN }
          );

          res.cookie("token", token, {
            httpOnly: true,
            maxAge: 3600000,
          });

          res.json({
            success: true,
            accessToken: token,
            email: user.email,
            role: user.role,
            userId: user._id.toString(),
          });
        } catch (error) {
          next(error);
        }
      }
    );

    app.put("/api/v1/user/status/:userId",
      async (req, res) => {
        const { userId } = req.params;
        const { status } = req.body;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            message: "Invalid user ID format",
          });
        }

        try {
          const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { status } }
          );

          if (result.matchedCount === 0) {
            return res
              .status(404)
              .json({ message: "User not found" });
          }

          res.json({
            success: true,
            message: "User status updated successfully",
          });

          const user = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });

          if (status.toLowerCase() === "completed") {
            const subject =
              "Your Account is Verified: Start Booking Mock Tests Now!";
            const messageContent = `
            <div>
              <p>Dear ${user.name},</p>
              <p>We are excited to inform you that your account on the Luminedge Mock Booking Portal has been verified. You can now log in and book your mock tests conveniently at <a href="https://luminedge.io">luminedge.io</a>.</p>
              <h4>Important Guidelines:</h4>
              <ul>
                <li><strong>Photo ID Requirement:</strong> You must present a valid photo ID (Passport/NID) on the day of your mock test.</li>
                <li><strong>Mock Test Terms & Conditions:</strong></li>
                <ul>
                  <li>Purchased or course-provided mock test(s) must be used within 6 months of the Money Receipt (MR) date.</li>
                  <li>Free mock test(s) must be taken within 10 days of the MR date.</li>
                  <li>Mock test bookings must be made at least 24 hours in advance, subject to availability.</li>
                  <li>Rescheduling is possible if requested 24 hours before the booked test date.</li>
                  <li>Late arrivals, no-shows, invalid photo IDs, or expired service validity may result in forfeiting the test, with no refund requests entertained.</li>
                </ul>
              </ul>
              <p>We recommend booking your mock tests early to secure your preferred schedule.</p>
              <p>For any assistance, feel free to contact us at 📞 01400-406374 | 01400-403475 | 01400-403486 | 01400-403487 | 01400-403493 | 01400-403494.</p>
              <p>Thank you for choosing Luminedge. We are committed to supporting your success!</p>
              <p>Best regards,</p>
              <p>The Luminedge Team</p>
            </div>
          `;

            const emailResult = await emailSender(
              subject,
              user.email,
              messageContent
            );

            if (emailResult.success) {
              console.log(
                `Email sent to user: ${user.email}`
              );
            } else {
              console.warn(
                `Failed to send email to user: ${user.email}, Error: ${emailResult.error}`
              );
            }
          }
        } catch (error) {
          console.error(
            "Error updating user status:",
            error
          );
        }
      }
    );

    app.get("/", (req, res) => {
      res.json({
        message: "Server is running smoothly",
        timestamp: new Date(),
      });
    });

    app.get("/api/v1/admin/get-schedules",
      async (req, res) => {
        try {
          const schedules = await schedulesCollection
            .find({})
            .toArray();
          res.json(schedules);
        } catch (error) {
          res.status(500).json({
            message: "Error fetching schedules",
            error,
          });
        }
      }
    );

    app.delete("/api/v1/admin/delete-schedule/:id",
      async (req, res) => {
        const { id } = req.params;
        try {
          const result = await schedulesCollection.deleteOne(
            { _id: new ObjectId(id) }
          );
          if (result.deletedCount === 0) {
            return res
              .status(404)
              .json({ message: "Schedule not found" });
          }
          res.json({
            success: true,
            message: "Schedule deleted successfully",
          });
        } catch (error) {
          res.status(500).json({
            message: "Error deleting schedule",
            error,
          });
        }
      }
    );

    app.get("/api/v1/user/all", async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.json(users);
      } catch (error) {
        res.status(500).json({
          message: "Error fetching users",
          error,
        });
      }
    });

    app.get("/api/v1/profile/:userId",
      async (req, res) => {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        try {
          const user = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            {
              projection: {
                name: 1,
                email: 1,
                contactNo: 1,
                passportNumber: 1,
                transactionId: 1,
                createdAt: 1,
                profileChangeRequestStatus: 1,
              },
            }
          );

          if (!user) {
            return res.status(404).json({
              success: false,
              message: "User not found",
            });
          }

          res.json({
            success: true,
            user: {
              ...user,
              phone: user.contactNo,
              passportId: user.passportNumber,
            },
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
          res.status(500).json({
            success: false,
            message: "Server error",
          });
        }
      }
    );

    app.post("/api/v1/user/request-profile-edit",
      async (req, res) => {
        try {
          const { userId, note } = req.body;

          if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid or missing userId",
            });
          }

          const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
              $set: {
                profileChangeRequestStatus: "requested",
                profileEditNote: note || "",
              },
            }
          );

          if (result.modifiedCount > 0) {
            return res.status(200).json({
              success: true,
              message: "Profile change request submitted",
            });
          } else {
            return res.status(404).json({
              success: false,
              message: "User not found or already requested",
            });
          }
        } catch (error) {
          console.error(
            "Error requesting profile edit:",
            error
          );
          res.status(500).json({
            success: false,
            message: "Internal server error",
          });
        }
      }
    );

    app.put("/api/v1/user/approve-profile-edit/:userId",
      async (req, res) => {
        try {
          const { userId } = req.params;
          const {
            name,
            email,
            phone,
            passportId,
            transactionId,
          } = req.body;

          if (!ObjectId.isValid(userId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid user ID",
            });
          }

          const updatePayload = {
            name,
            email,
            contactNo: phone,
            passportNumber: passportId,
            transactionId,
            profileChangeRequestStatus: "default",
            profileEditNote: null,
            updatedAt: new Date(),
          };

          const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updatePayload }
          );

          if (result.modifiedCount === 0) {
            return res.status(404).json({
              success: false,
              message:
                "User not found or no changes made",
            });
          }

          res.status(200).json({
            success: true,
            message: "User profile updated by admin",
          });
        } catch (error) {
          console.error(
            "Error approving profile edit:",
            error
          );
          res
            .status(500)
            .json({ success: false, message: "Server error" });
        }
      }
    );

    app.get("/api/v1/users/with-profile-request",
      async (_req, res) => {
        try {
          const users = await usersCollection
            .find({ profileChangeRequestStatus: "requested" })
            .project({
              _id: 1,
              name: 1,
              email: 1,
              profileChangeRequestStatus: 1,
              profileEditNote: 1,
              contactNo: 1,
              passportNumber: 1,
              transactionId: 1,
            })
            .toArray();

          return res
            .status(200)
            .json({ success: true, users });
        } catch (error) {
          console.error(
            "Error fetching requested users:",
            error
          );
          res.status(500).json({
            success: false,
            message: "Server error",
          });
        }
      }
    );

    app.put("/api/v1/user/change-password",
      async (req, res) => {
        try {
          const { email, oldPassword, newPassword } =
            req.body;
          if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({
              message:
                "Email, oldPassword, newPassword are required",
            });
          }

          const user = await usersCollection.findOne({
            email,
            status: "active",
          });
          if (!user)
            return res
              .status(404)
              .json({ message: "User not found or inactive" });

          const ok = await bcrypt.compare(
            oldPassword,
            user.password
          );
          if (!ok)
            return res
              .status(401)
              .json({ message: "Password incorrect" });

          const hashed = await bcrypt.hash(newPassword, 12);
          await usersCollection.updateOne(
            { _id: user._id },
            {
              $set: {
                password: hashed,
                needPasswordChange: false,
              },
            }
          );
          return res.json({
            message: "Password changed successfully!",
          });
        } catch (e) {
          console.error("change-password error:", e);
          return res
            .status(500)
            .json({ message: "Server error" });
        }
      }
    );

    app.post("/api/v1/auth/forget-password",
      async (req, res) => {
        try {
          const { email } = req.body;

          if (!email) {
            return res.status(400).json({
              success: false,
              message: "Email is required",
            });
          }

          const userData = await usersCollection.findOne({
            email,
          });

          if (!userData) {
            return res.status(404).json({
              success: false,
              message: "User not found or inactive!",
            });
          }

          const resetPassToken = jwt.sign(
            { email: userData.email, userId: userData._id },
            process.env.JWT_RESET_PASS_SECRET,
            {
              expiresIn:
                process.env.JWT_RESET_PASS_TOKEN_EXPIRES_IN,
            }
          );

          const resetPassLink = `${process.env.RESET_PASS_LINK}?userId=${userData._id}&token=${resetPassToken}`;

          const subject =
            "Password Reset Request - Luminedge";
          const content = `
      <div>
        <p>Dear ${userData.name},</p>
        <p>We received a request to reset your password. Click the button below to proceed:</p>
        <a href="${resetPassLink}" style="text-decoration: none;">
          <button style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
            Reset Password
          </button>
        </a>
        <p>If the button above does not work, copy and paste this link into your browser:</p>
        <p>${resetPassLink}</p>
        <p>Thank you,</p>
        <p>The Luminedge Team</p>
      </div>
    `;

          await emailSender(subject, userData.email, content);

          res.json({
            success: true,
            message: "Password reset link sent successfully",
          });
        } catch (error) {
          console.error(
            "Error in forget-password route:",
            error
          );
          res.status(500).json({
            success: false,
            message: "Internal Server Error",
          });
        }
      }
    );

    app.put("/api/v1/auth/reset-password",
      async (req, res) => {
        try {
          const { userId, token, newPassword } = req.body;

          if (!userId || !token || !newPassword) {
            return res.status(400).json({
              success: false,
              message: "All fields are required",
            });
          }

          let decoded;
          try {
            decoded = jwt.verify(
              token,
              process.env.JWT_RESET_PASS_SECRET
            );
          } catch (error) {
            return res.status(400).json({
              success: false,
              message: "Invalid or expired token!",
            });
          }

          if (decoded.userId !== userId) {
            return res.status(400).json({
              success: false,
              message: "Token mismatch!",
            });
          }

          const userData = await usersCollection.findOne({
            _id: new ObjectId(userId),
          });

          if (!userData) {
            return res.status(404).json({
              success: false,
              message: "User not found or inactive!",
            });
          }

          const hashedPassword = await bcrypt.hash(
            newPassword,
            12
          );

          await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { password: hashedPassword } }
          );

          res.json({
            success: true,
            message: "Password reset successfully",
          });
        } catch (error) {
          console.error(
            "Error in reset-password route:",
            error
          );
          res.status(500).json({
            success: false,
            message: "Internal Server Error",
          });
        }
      }
    );

    app.put("/api/v1/user/block/:userId",
      async (req, res) => {
        const { userId } = req.params;
        const { isDeleted } = req.body;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            message: "Invalid user ID format",
          });
        }

        try {
          const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { isDeleted: isDeleted } }
          );

          if (result.matchedCount === 0) {
            return res
              .status(404)
              .json({ message: "User not found" });
          }
          res.json({
            success: true,
            message: `User ${
              isDeleted ? "blocked" : "unblocked"
            } successfully`,
          });
        } catch (error) {
          console.error(
            "Error updating user status:",
            error
          );
          res.status(500).json({
            message: "Error updating user status",
            error,
          });
        }
      }
    );

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        message:
          "An unexpected error occurred. Please try again later.",
      });
    });

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);
