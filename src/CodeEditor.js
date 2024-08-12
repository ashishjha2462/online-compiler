import React, { useState } from "react";
import MonacoEditor, { loader } from "@monaco-editor/react";

loader.config({
  paths: {
    vs: '/min/vs',
  },
});

const CodeEditor = () => {
  const [code, setCode] = useState("// Write your JavaScript code here");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);

    if (selectedLanguage === "javascript") {
      setCode("// Write your JavaScript code here");
    } else if (selectedLanguage === "cpp") {
      setCode("// Write your C++ code here");
    } else if (selectedLanguage === "python") {
      setCode("# Write your Python code here");
    }
  };

  const runCode = async (code, lang, inputs) => {
    const endpoint = lang === "javascript" ? "run-js" : lang === "cpp" ? "run-cpp" : "run-python";

    const response = await fetch(`http://localhost:5000/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, inputs }),
    });

    const data = await response.json();
    return data.output || data.error;
  };

  const handleRunClick = async () => {
    setLoading(true);
    const inputs = inputText.split("\n");
    const result = await runCode(code, language, inputs);
    setOutput(result);
    setLoading(false);
  };

  return (
    <div style={{  padding: "40px" }}>
      <select value={language} onChange={handleLanguageChange} style={{ marginBottom: "10px", padding: "5px" }}>
        <option value="javascript">JavaScript</option>
        <option value="cpp">C++</option>
        <option value="python">Python</option>
      </select>
      <div style={{ height: "calc(100vh - 500px)", width: "80%", border: "2px solid #ddd", borderRadius: "5px" }}>
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            automaticLayout: true,
            codeLens: true,
            contextmenu: true,
            suggestOnTriggerCharacters: true,
            minimap: { enabled: false },
            quickSuggestions: { other: true, comments: true, strings: true },
            parameterHints: { enabled: true },
          }}
        />
      </div>
      <div style={{display: "flex", width: "80%"}}>
      <div style={{ marginTop: "10px" }}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter inputs here"
          style={{
            width: "80%",
            height: "80px",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            marginTop: "10px",
          }}
        />
      </div>
      <button
        style={{
          height: "40px",
          marginTop: "70px",
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
        onClick={handleRunClick}
      >
        {loading ? "Running..." : "Run"}
      </button>
      </div>
      <div
        style={{
          width: "79%",
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#282c34",
          color: "white",
          borderRadius: "5px",
        }}
      >
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default CodeEditor;