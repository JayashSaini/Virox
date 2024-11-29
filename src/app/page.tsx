"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypePrism from "rehype-prism";
import "prismjs/themes/prism-okaidia.css"; // Dark theme
import { PlaceholdersAndVanishInput } from "@/components/placeholder";
import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";

// Define the expected structure of response
interface GenerativeResponse {
  candidates:
    | {
        content: {
          parts: {
            text: string;
          }[];
        };
      }[]
    | undefined; // Handle the case where candidates might be undefined
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_AI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const placeholders = [
    "Why did the computer go to therapy?",
    "Is AI dreaming of electric sheep or electric bills?",
    "Who would win: AI or a toddler with a crayon?",
    "Write a poem about why 404 errors are heartbreaking.",
    "How can I train my toaster to do my homework?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    model
      .generateContent([query])
      .then((result: GenerateContentResult) => {
        const response = result.response as GenerativeResponse;
        // Ensure that candidates is not undefined and has content
        if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
          setResult(response.candidates[0].content.parts[0].text);
        } else {
          setResult("No content generated.");
        }
      })
      .catch((e: Error) =>
        alert(e.message || "Error occurred while generating content!")
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="w-full min-h-screen h-full px-4 relative ">
      <p className="text-yellow-400 absolute top-3 right-3 ">
        By{" "}
        <a href="https://jayash-dev.vercel.app/" target="_blank">
          Jayash.
        </a>
      </p>
      <div className="max-w-screen-sm w-full m-auto sm:pt-52 pt-32">
        <h2 className="mb-3 sm:mb-10 text-2xl text-center sm:text-5xl dark:text-slate-100 text-black">
          Ask Virox Anything
        </h2>
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
        {result && (
          <div className=" sm:mt-2 mt-1 px-2  sm:px-10  sm:py-5 py-3">
            <div className="text-slate-100  sm:text-base text-sm ">
              <ReactMarkdown rehypePlugins={[rehypePrism]}>
                {result}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
