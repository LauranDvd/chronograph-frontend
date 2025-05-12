import ReactMarkdown from "react-markdown";

export function MarkdownMessage({ sender, content }: { sender: string, content: string }) {
  return <ReactMarkdown>{content}</ReactMarkdown>;
}
