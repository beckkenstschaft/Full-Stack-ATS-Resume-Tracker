const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const docxParser = require("docx-parser");
const path = require("path");
const fs = require("fs");

const spellChecker = require("spellchecker");
const GrammarBot = require("grammarbot");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// Resume Checker
app.post("/upload", upload.single("resume"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.json({ success: false, message: "No file uploaded" });
  }

  try {
    let textContent;
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext === ".pdf") {
      const data = await pdfParse(fs.readFileSync(file.path));
      textContent = data.text;
    } else if (ext === ".doc" || ext === ".docx") {
      textContent = await parseDocx(file.path);
    } else {
      return res.json({ success: false, message: "Invalid file type" });
    }

    const {
      score,
      keywordDetails,
      techKeywords,
      softSkills,
      missingSkills,
      compliant,
      jobRoles,
    } = calculateATSScore(textContent);
    res.json({
      success: true,
      score,
      keywordDetails,
      techKeywords,
      softSkills,
      missingSkills,
      compliant,
      jobRoles,
      textContent,
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    res.json({
      success: false,
      message: "Failed to process resume",
      error: error.message,
    });
  } finally {
    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete uploaded file:", err);
    });
  }
});

function calculateATSScore(textContent) {
  const techKeywords = [
    { term: "Java", weight: 15 },
    { term: "Python", weight: 15 },
    { term: "SQL", weight: 15 },
    { term: "CRM", weight: 5 },
    { term: "Database", weight: 10 },
    { term: "C", weight: 20 },
    { term: "Nodejs", weight: 15 },
    { term: "CPP", weight: 5 },
    { term: "Development", weight: 10 },
    { term: "Btech", weight: 5 },
    { term: "Computer Science and Engineering", weight: 25 },
    { term: "cse", weight: 5 },
    { term: "bca", weight: 5 },
    { term: "mca", weight: 5 },
    { term: "mtech", weight: 5 },
    { term: "Data Science", weight: 10 },
    { term: "Data Structures", weight: 25 },
    { term: "algorithms", weight: 15 },
    { term: "Machine learning", weight: 10 },
    { term: "react", weight: 15 },
    { term: "angular", weight: 15 },
    { term: "vue", weight: 15 },
    { term: "docker", weight: 15 },
    { term: "aws", weight: 15 },
    { term: "azure", weight: 15 },
    { term: "gcp", weight: 5 },
    { term: "kubernetes", weight: 15 },
    { term: "flutter", weight: 15 },
    { term: "PHP", weight: 15 },
    { term: "Salesforce", weight: 15 },
    { term: "Software Development", weight: 15 },
    { term: "JavaScript", weight: 15 },
    { term: "Git", weight: 15 },
    { term: "GitHub", weight: 15 },
    { term: "Bootstrap", weight: 10 },
    { term: "Netlify", weight: 10 },
    { term: "HTML5", weight: 10 },
    { term: "CSS3", weight: 10 },
    { term: "LinuxOS", weight: 10 },
    { term: "UnixOS", weight: 10 },
    { term: "Full stack", weight: 10 },
    { term: "Database Management", weight: 10 },
    { term: "Data Analysis", weight: 10 },
    { term: "CRM Administration", weight: 10 },
  ];

  const softSkills = [
    "communication",
    "teamwork",
    "problem-solving",
    "leadership",
    "adaptability",
  ];

  const jobRoles = [
    "Software Engineer",
    "Data Scientist",
    "Project Manager",
    "Database Administrator",
    "Web Developer",
  ];

  let totalWeight = 0;
  let score = 0;
  let foundkeyword = 0;
  const keywordDetails = [];
  let foundTechKeywords = [];
  let foundSoftSkills = [];
  let missingSoftSkills = [];
  let compliant = false;
  let jobRolesFound = [];

  techKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword.term}\\b`, "gi");
    const matches = textContent.match(regex);

    if (matches) {
      const keywordScore = keyword.weight * matches.length;
      score += keywordScore;
      foundTechKeywords.push(keyword.term);
      foundkeyword++;
      keywordDetails.push({
        term: keyword.term,
        count: matches.length,
        score: keywordScore,
        weight: keyword.weight,
      });
    }

    totalWeight += keyword.weight * 2;
  });

  softSkills.forEach((skill) => {
    const regex = new RegExp(`\\b${skill}\\b`, "gi");
    if (textContent.match(regex)) {
      foundSoftSkills.push(skill);
    } else {
      missingSoftSkills.push(skill);
    }
  });

  jobRoles.forEach((role) => {
    const regex = new RegExp(`\\b${role}\\b`, "gi");
    if (textContent.match(regex)) {
      jobRolesFound.push(role);
    }
  });

  const finalScore = Math.round((score / totalWeight) * 100);
  compliant = finalScore >= 35; // Example threshold for ATS compliance

  return {
    score: finalScore,
    keywordDetails,
    techKeywords: foundTechKeywords,
    softSkills: foundSoftSkills,
    missingSkills: missingSoftSkills,
    compliant,
    jobRoles: jobRolesFound,
  };
}

async function parseDocx(filePath) {
  return new Promise((resolve, reject) => {
    try {
      docxParser.parseDocx(
        filePath,
        (data) => {
          resolve(data);
        },
        (err) => {
          reject(err);
        }
      );
    } catch (error) {
      console.error("Error parsing DOCX:", error);
      reject(error);
    }
  });
}

// Referral Request Writer
// Create a post route, to the 'referral' endpoint
app.post("/referral", (req, res) => {
  // Extract the below info from the form filled
  const { name, position, company, reason } = req.body;

  if (!name || !position || !company || !reason) {
    return res.json({ success: false, message: "All fields are required" });
  }

  const referralContent = `Dear Sir/Mam,\n

  I hope you are doing well. I am seeking a referral for the ${position} 
  at ${company}. With my background in ${reason}, I am confident I would 
  be a strong fit. Your support would be greatly appreciated. Please let 
  me know if you need any additional information.\n

  Best regards,
  ${name}`;

  // Sends a JSON resonpe with the referralcontent
  res.json({ success: true, referralContent });
});

// Cover Letter Review
const grammarBot = new GrammarBot({
  api_key: "YOUR_GRAMMARBOT_API_KEY", // Replace with your GrammarBot API key if necessary
});

app.post(
  "/review-cover-letter",
  upload.single("coverLetter"),
  async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.json({ success: false, message: "No file uploaded" });
    }

    try {
      let textContent;
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === ".pdf") {
        const data = await pdfParse(fs.readFileSync(file.path));
        textContent = data.text;
      } else if (ext === ".doc" || ext === ".docx") {
        textContent = await parseDocx(file.path);
      } else {
        return res.json({ success: false, message: "Invalid file type" });
      }

      // Perform the reviews
      const wordCount = countWords(textContent);
      const vocabularyComplexity = checkVocabularyComplexity(textContent);
      const typos = checkTypos(textContent);
      const grammarErrors = await checkGrammar(textContent);

      const feedback = reviewCoverLetter(
        textContent,
        wordCount,
        vocabularyComplexity,
        typos,
        grammarErrors
      );
      res.json({ success: true, feedback });
    } catch (error) {
      console.error("Error processing cover letter:", error);
      res.json({
        success: false,
        message: "Failed to process cover letter",
        error: error.message,
      });
    } finally {
      fs.unlink(file.path, (err) => {
        if (err) console.error("Failed to delete uploaded file:", err);
      });
    }
  }
);

function countWords(text) {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

function checkVocabularyComplexity(text) {
  const simpleWords = [
    "good",
    "bad",
    "big",
    "small",
    "happy",
    "sad",
    "easy",
    "hard",
  ]; // Add more simple words as needed

  const words = text.split(/\s+/).map((word) => word.toLowerCase());
  const complexWords = words.filter((word) => !simpleWords.includes(word));

  const complexityRatio = (complexWords.length / words.length) * 100;
  return complexityRatio > 50 ? "Complex" : "Simple";
}

function checkTypos(text) {
  const words = text.split(/\s+/);
  const typos = words.filter((word) => spellChecker.isMisspelled(word));
  return typos.length > 0 ? typos : "Great, no typos!";
}

async function checkGrammar(text) {
  return new Promise((resolve, reject) => {
    grammarBot.check(text, (error, result) => {
      if (error) {
        reject(error);
      } else {
        const errors = result.matches.map((match) => match.message);
        resolve(errors.length > 0 ? errors : "Great, no grammatical errors!");
      }
    });
  });
}

function reviewCoverLetter(
  textContent,
  wordCount,
  vocabularyComplexity,
  typos,
  grammarErrors
) {
  return `
    \nYour cover letter is ${wordCount} words long.\n

    Vocabulary complexity: ${vocabularyComplexity}.\n
    
    ${Array.isArray(typos) ? `Typos found: ${typos.join(", ")}` : typos}\n
    
    ${
      Array.isArray(grammarErrors)
        ? `Grammar errors: ${grammarErrors.join(", ")}`
        : grammarErrors
    }`;
}

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
