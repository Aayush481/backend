const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
 let skill = [];
const app = express();
app.use(cors());
app.use(express.json());

const uploadFolder = "./uploads";
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// **🔹 Predefined Large Object of Skills**


// **🔹 Improved Skill Matching Using Regex**






const skillsList = [
  "python", "java", "javascript", "react", "html", "css", "nodejs", "typescript",
  "c++", "c#", "swift", "kotlin", "sql", "mongodb", "git", "docker", "aws",
  "graphql", "machine learning", "deep learning", "nlp", "data science",
  "flask", "django", "spring", "angular", "vue", "tensorflow", "pandas", "numpy",
  "rest api", "kubernetes", "azure", "linux", "bash", "express.js", "jwt",
  "oauth2", "redux", "tailwind css", "sass", "webpack", "babel", "graphql",
  "microservices", "serverless", "ci/cd", "jenkins", "terraform", "ansible"
]

function extractSkills(text) {
   if (typeof text !== 'string' || !text.trim()) {
        return []; // Prompt is not a valid non-empty string
    }
    for (const query of skillsList) {
        if (query.trim.toLowerCase().includes(text.trim.toLowerCase())) {
            skill.push(text);
            return skill; // Indicates the prompt matches one of the queries
        }
    }
   
}




// **🔹 Extract Text from DOCX Files**
function extractSkills(text) {
    if (typeof text !== 'string' || !text.trim()) {
        return []; // ✅ Returns an empty array if the text is invalid
    }

    return skillsList.filter(skill => {
        const regex = new RegExp(`\\b${skill.replace(/[-+]/g, "\\$&")}\\b`, "gi");
        return regex.test(text);
    });
}

// **🔹 Upload & Extract Skills from Resume**
app.post("/upload", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = path.join(uploadFolder, req.file.filename);
    let textData = "";

    if (req.file.mimetype === "application/pdf") {
      const fileBuffer = fs.readFileSync(filePath);
      const pdfText = await pdfParse(fileBuffer);
      textData = pdfText.text;
    } else if (req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      textData = await extractTextFromDocx(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported file format. Only PDF & DOCX are allowed." });
    }

    // **🔹 Preprocess Resume Text Before Extraction**
    textData = textData.replace(/\n/g, " ").replace(/\s+/g, " ").toLowerCase().trim();

    // **🔹 Extract skills from resume text**
    const skills = extractSkills(textData);

    // **🔹 Save extracted skills in a JSON file**
    const jsonFilePath = path.join(uploadFolder, `${req.file.filename}.json`);
    fs.writeFileSync(jsonFilePath, JSON.stringify({ filename: req.file.filename, skills }, null, 2));

    console.log(`✅ JSON file saved at: ${jsonFilePath}`);

    res.json({ message: "Resume processed successfully!", filename: req.file.filename, skills });

  } catch (error) {
    console.error("❌ Error processing resume:", error);
    res.status(500).json({ error: "Error processing resume" });
  }
});

// **🔹 Retrieve Extracted Skills from JSON File**
app.get("/resume/:filename", async (req, res) => {
  const { filename } = req.params;
  const jsonFilePath = path.join(uploadFolder, `${filename}.json`);

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`❌ Resume JSON not found: ${jsonFilePath}`);
    return res.status(404).json({ error: "Resume data not found" });
  }

  try {
    const jsonData = fs.readFileSync(jsonFilePath, "utf-8");
    const parsedData = JSON.parse(jsonData);

    res.json({ message: "Skills retrieved successfully!", filename: parsedData.filename, skills: parsedData.skills });

  } catch (error) {
    console.error("❌ Error retrieving resume data:", error);
    res.status(500).json({ error: "Error retrieving resume data" });
  }
});

// **🔹 Start Express Server**
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});