import { useState } from "react";
import "./App.css";
import {
  GoogleGenAI,
  createUserContent,
  createPartFromBase64,
} from "@google/genai";
import HTMLPreviewToggle from "./components/HTMLPreviewToggle";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

function App() {
  const [imageBase64, setImageBase64] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [names, setNames] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [headings, setHeadings] = useState([]);
  const [selectedHeading, setSelectedHeading] = useState(null);
  const [websiteCopy, setWebsiteCopy] = useState("");
  const [splashHTML, setSplashHTML] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [isGeneratingHeadings, setIsGeneratingHeadings] = useState(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [isGeneratingHTML, setIsGeneratingHTML] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      setImageBase64(reader.result.split(",")[1]);
    };

    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imageBase64) return alert("Please upload the image first");
    setIsLoading(true);

    try {
      const prompt = `This image contains a sketch of a potential product along with some notes.Given the product sketch, describe the product as thoroughly as possible based on what you see in the image, making sure to note all of the product features. Return output in json format.`;
      const imagePart = createPartFromBase64(imageBase64, "image/jpeg");

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [createUserContent([prompt, imagePart])],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              description: { type: "string" },
              features: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["description", "features"],
          },
        },
      });
      setProductInfo(JSON.parse(response.text));
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNames = async () => {
    setIsGeneratingNames(true);
    try {
      const prompt = `You are a marketing whiz and writer trying to come up with a name for the product shown in the image. Come up with ten varied, interesting possible names.`;
      const imagePart = createPartFromBase64(imageBase64, "image/jpeg");

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [createUserContent([prompt, imagePart])],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: { type: "string" },
          },
        },
      });

      const names = JSON.parse(response.text);
      setNames(names);
      setSelectedName(names[0]);
    } catch (error) {
      console.error("Error generating names:", error);
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const generateHeadings = async () => {
    if (!selectedName || !productInfo) {
      alert("Please select a product name and analyze the image first");
      return;
    }
    setIsGeneratingHeadings(true);

    try {
      const prompt = `You're a marketing whiz and expert copywriter. You're writing website copy for a product named ${selectedName}. Your first job is to come up with H1 H2 copy. These are brief, pithy sentences or phrases that are the first and second things the customer sees when they land on the splash page. Here are some examples: 
      [{
        "h1": "A feeling is canned",
        "h2": "drinks and powders to help you feel calm cool and collected despite the stressful world around you"
       },
       {
        "h1": "Design. Publish. Done.",
        "h2": "Stop rebuilding your designs from scratch. In Framer, everything you put on the canvas is ready to be published to the web."
      }]
      Create the same json output for a product named "${selectedName}" with description "${productInfo.description}". Output ten different options as json in an array.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [createUserContent([prompt])],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                h1: { type: "string" },
                h2: { type: "string" },
              },
              required: ["h1", "h2"],
            },
          },
        },
      });

      const headingsData = JSON.parse(response.text);
      setHeadings(headingsData);
      setSelectedHeading(headingsData[0]);
      setWebsiteCopy(headingsData[0]);
    } catch (error) {
      console.error("Error generating headings:", error);
    } finally {
      setIsGeneratingHeadings(false);
    }
  };

  const generateWebsiteCopy = async () => {
    if (!selectedHeading) {
      alert("Please select a heading first");
      return;
    }

    setIsGeneratingCopy(true);

    try {
      // Use the selected heading directly
      setWebsiteCopy(selectedHeading);
      generateHTML(selectedHeading.h1, selectedHeading.h2);
    } catch (error) {
      console.error("Error generating website copy:", error);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const generateHTML = async (h1, h2) => {
    setIsGeneratingHTML(true);

    try {
      const htmlPrompt = `Generate HTML and CSS for a splash page for a new product called ${selectedName}. Output only HTML and CSS and do not link to any external resources. Ensure background should have gradient and do vibrant styling. Include the top level title: "${h1}" with the subtitle: "${h2}". Return the HTML directly, do not wrap it in triple-back-ticks.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [createUserContent([htmlPrompt])],
      });
      setSplashHTML(response.text);
    } catch (error) {
      console.error("Error generating HTML:", error);
    } finally {
      setIsGeneratingHTML(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(splashHTML)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const downloadHTML = () => {
    const element = document.createElement("a");
    const file = new Blob([splashHTML], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedName
      .toLowerCase()
      .replace(/\s+/g, "-")}-splash-page.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="App">
      <h1>Product Sketch Analyzer</h1>
      <div className="image-upload-section">
        <input type="file" onChange={handleImageUpload} accept="image/*" />
        {imageBase64 && (
          <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Preview" />
        )}
        <button onClick={analyzeImage} disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Analyze Image"}
        </button>

        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Analyzing your image...</p>
          </div>
        )}
      </div>

      <div className="analysis-results">
        {productInfo && <pre>{JSON.stringify(productInfo, null, 2)}</pre>}
      </div>

      <div className="section-divider">
        <h2>Product Naming</h2>
        <button
          onClick={generateNames}
          disabled={isGeneratingNames || !imageBase64}
        >
          {isGeneratingNames ? "Generating Names..." : "Generate Names"}
        </button>

        {isGeneratingNames && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating product names...</p>
          </div>
        )}

        {names.length > 0 && (
          <div>
            <label htmlFor="nameSelect">Select a name:</label>
            <select
              id="nameSelect"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
            >
              {names.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="section-divider">
        <h2>Website Headings</h2>
        <button
          onClick={generateHeadings}
          disabled={isGeneratingHeadings || !selectedName || !productInfo}
        >
          {isGeneratingHeadings
            ? "Generating Headings..."
            : "Generate Headings"}
        </button>

        {isGeneratingHeadings && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating website headings...</p>
          </div>
        )}

        {headings.length > 0 && (
          <div>
            <label htmlFor="headingSelect">Select a heading:</label>
            <select
              id="headingSelect"
              value={selectedHeading ? JSON.stringify(selectedHeading) : ""}
              onChange={(e) => {
                const selected = JSON.parse(e.target.value);
                setSelectedHeading(selected);
                setWebsiteCopy(selected);
              }}
              className="heading-select"
            >
              {headings.map((heading, index) => (
                <option key={index} value={JSON.stringify(heading)}>
                  {index + 1}. {heading.h1} | {heading.h2}
                </option>
              ))}
            </select>

            {selectedHeading && (
              <div className="selected-heading-preview">
                <h3>Selected Heading:</h3>
                <div className="heading-preview">
                  <h4>{selectedHeading.h1}</h4>
                  <p>{selectedHeading.h2}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="section-divider">
        <h2>Website Copy</h2>
        <button
          onClick={generateWebsiteCopy}
          disabled={isGeneratingCopy || !selectedHeading}
        >
          {isGeneratingCopy ? "Generating Copy..." : "Generate Website Copy"}
        </button>

        {isGeneratingCopy && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating website copy...</p>
          </div>
        )}

        <div>
          {websiteCopy && (
            <>
              <h2>{websiteCopy.h1}</h2>
              <p>{websiteCopy.h2}</p>
            </>
          )}
        </div>

        {isGeneratingHTML && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating HTML...</p>
          </div>
        )}

        {splashHTML && (
          <div className="html-preview-container">
            <HTMLPreviewToggle rawHTML={splashHTML} />

            <div className="html-actions">
              <button
                className="action-button copy-button"
                onClick={copyToClipboard}
              >
                {copySuccess ? "Copied!" : "Copy to Clipboard"}
              </button>
              <button
                className="action-button download-button"
                onClick={downloadHTML}
              >
                Download HTML
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
