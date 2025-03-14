import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import process from "node:process";

// emulate __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// paths
const reactBuildDir = path.join(__dirname, "dist");
const assetsDir = path.join(reactBuildDir, "assets"); // 'assets' folder inside the dist folder
const googleAppScriptDir = path.join(__dirname, "../Backend-GAS");

// Define file patterns to match
const filePatterns = [
  /^index-.*\.js$/, // Matches dynamic JS files like index-CJV1iWCa.js
  /^index-.*\.css$/, // Matches dynamic CSS files like index-kQJbKSsj.css
];

const findFilesByPattern = (directory, pattern) => {
  const files = fs.readdirSync(directory);
  return files.filter((file) => pattern.test(file));
};

// Find files based on patterns
const jsFiles = findFilesByPattern(assetsDir, filePatterns[0]);
const cssFiles = findFilesByPattern(assetsDir, filePatterns[1]);

if (jsFiles.length === 0 || cssFiles.length === 0) {
  console.error("Required build files not found!");
  process.exit(1);
}

// Define the files to copy
const filesToCopy = [
  ...jsFiles.map((jsFile) => ({
    src: path.join(assetsDir, jsFile),
    dest: path.join(googleAppScriptDir, "index.js.html"),
  })),
  ...cssFiles.map((cssFile) => ({
    src: path.join(assetsDir, cssFile),
    dest: path.join(googleAppScriptDir, "index.css.html"),
  })),
];

const requiredFiles = [
  path.join(googleAppScriptDir, "index.js.html"),
  path.join(googleAppScriptDir, "index.css.html"),
];

// Ensure the necessary files are in place (create if they don't exist)
requiredFiles.forEach((file) => {
  if (!fs.existsSync(file)) {
    // Empty content for initialization
    fs.writeFileSync(file, "");
    console.log(`Created ${file}`);
  }
});

// Predefined static content for index.html
const staticHtmlContent = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <?!= HtmlService.createHtmlOutputFromFile('index.css.html').getContent(); ?>
  </head>
  <body class="container">
    <div id="root"></div>
    <?!= HtmlService.createHtmlOutputFromFile('index.js.html').getContent(); ?>
  </body>
</html>`;

// Ensure the static content of index.html is always present
const indexHtmlPath = path.join(googleAppScriptDir, "index.html");
if (
  !fs.existsSync(indexHtmlPath) ||
  fs.readFileSync(indexHtmlPath, "utf8") !== staticHtmlContent
) {
  fs.writeFileSync(indexHtmlPath, staticHtmlContent);
  console.log(`Updated ${indexHtmlPath} with static content.`);
}

console.log("Source Directory:", assetsDir);
console.log("Destination Directory:", googleAppScriptDir);
console.log("JS Files Found:", jsFiles);
console.log("CSS Files Found:", cssFiles);

const isFileContentDifferent = (src, dest, isJsFile) => {
  if (!fs.existsSync(dest)) return true;

  // Read the source file content
  let srcContent = fs.readFileSync(src, "utf8");

  // Wrap the source content in <script> or <style> tags
  if (isJsFile) {
    srcContent = `<script>\n${srcContent}\n</script>`;
  } else {
    srcContent = `<style>\n${srcContent}\n</style>`;
  }

  const destContent = fs.readFileSync(dest, "utf8");

  // Compare the wrapped source content with the destination content
  return srcContent !== destContent;
};

// Proceed to copy and update the files if content is different
filesToCopy.forEach(({ src, dest }) => {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  let fileContent = fs.readFileSync(src, "utf8");
  
  if (dest.endsWith("index.js.html")) {
    fileContent = `<script>\n${fileContent}\n</script>`;
  } else if (dest.endsWith("index.css.html")) {
    fileContent = `<style>\n${fileContent}\n</style>`;
  }

  // Check if the wrapped content is different
  const isJsFile = dest.endsWith("index.js.html");
  if (isFileContentDifferent(src, dest, isJsFile)) {
    fs.writeFileSync(dest, fileContent);
    console.log(`Copied/Updated ${src} -> ${dest}`);
  }
});

console.log("Done copying and updating build files");
