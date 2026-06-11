"use client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { AIThinking } from "@/components/ai-elements/ai-thinking";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import AirAIChatAnalysis from "@/components/dashboard/air/AirAIChatAnalysisComponent";
import BiodiversityAIChatAnalysis from "@/components/dashboard/biodiversity/BiodiversityAIChatAnalysisComponent";
import NoiseAIChatAnalysis from "@/components/dashboard/noise/NoiseAIChatAnalysisComponent";
import SoilAIChatAnalysis from "@/components/dashboard/soil/SoilAIChatAnalysisComponent";
import WasteAIChatAnalysis from "@/components/dashboard/waste/WasteAIChatAnalysisComponent";
import WaterAIChatAnalysis from "@/components/dashboard/water/WaterAIChatAnalysisComponent";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  BarChart3,
  Bird,
  Droplets,
  MapPin,
  Sparkles,
  Sprout,
  Trash2,
  Volume2,
  Wind,
  Copy,
  Check,
  FileText,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AIChatbotPage = () => {
  const [text, setText] = useState<string>("");
  const [reportMode, setReportMode] = useState<boolean>(false);
  const [webSearch, setWebSearch] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const { messages, status, sendMessage } = useChat();
  const router = useRouter();

  const lastMessage = messages[messages.length - 1];
  const isThinking =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      !lastMessage.parts?.some(
        (part: any) => part.type === "text" && part.text?.trim(),
      ));

  const getMessageText = (message: any) => {
    if (!message.parts) return "";
    return message.parts
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("\n");
  };

  const handleCopy = (messageId: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    });
  };

  const isAnalysisPart = (part: any) => {
    return [
      "tool-displayAirData",
      "tool-displayWaterData",
      "tool-displaySoilData",
      "tool-displayNoiseData",
      "tool-displayBiodiversityData",
      "tool-displayWasteData",
    ].includes(part.type);
  };

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: { reportMode, webSearch },
      },
    );
    setText("");
  };

  const handleGoback = () => {
    router.back();
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "air":
        return Wind;
      case "water":
        return Droplets;
      case "soil":
        return Sprout;
      case "noise":
        return Volume2;
      case "biodiversity":
        return Bird;
      case "waste":
        return Trash2;
      default:
        return BarChart3;
    }
  };

  const renderAnalysisButton = (type: string, label: string, icon: any) => {
    const Icon = icon;
    return (
      <Button
        variant="outline"
        className="group hover:bg-primary/10 border-border hover:border-primary/50 rounded-full transition-all flex items-center gap-1.5 px-3 py-1 h-8 text-xs font-medium"
        size="sm"
      >
        <span>{label}</span>
        <Icon className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
      </Button>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Button
            onClick={handleGoback}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">
              Environmental AI Assistant
            </h1>
          </div>
          <div className="flex w-20 justify-end">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl flex flex-col h-[calc(100vh-8rem)]">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Conversation className="flex-1">
              <ConversationContent className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">
                        Welcome to Environmental AI
                      </h2>
                      <p className="text-muted-foreground max-w-md">
                        Ask me anything about environmental monitoring data,
                        analysis, or insights.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      <Badge variant="secondary" className="text-xs">
                        Air Quality
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Water Analysis
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Soil Health
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Biodiversity
                      </Badge>
                    </div>
                  </div>
                )}

                {messages.map((message, msgIdx) => (
                  <Message
                    from={message.role}
                    key={`msg-${message.id}-${msgIdx}`}
                    className={`mb-4 ${message.role === "assistant" ? "bg-transparent" : ""}`}
                  >
                    <MessageContent
                      variant={message.role === "assistant" ? "flat" : "contained"}
                      className="rounded-lg flex flex-col gap-3 w-full max-w-[85%]"
                    >
                      {/* Render text and locations */}
                      <div className="flex flex-col gap-2">
                        {message.parts
                          .filter((part) => part.type === "text" || part.type === "tool-displayLocationData")
                          .map((part, i) => {
                            if (part.type === "text") {
                              if (message.role === "user") {
                                return (
                                  <div
                                    key={`${message.id}-text-${i}`}
                                    className="whitespace-pre-wrap text-lg font-normal text-foreground"
                                  >
                                    {part.text}
                                  </div>
                                );
                              }
                              return (
                                <div key={`${message.id}-text-${i}`} className="prose prose-base dark:prose-invert max-w-none">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mt-4 mb-2 first:mt-0">{children}</h1>,
                                      h2: ({ children }) => <h2 className="text-xl font-bold text-foreground mt-3 mb-2 first:mt-0">{children}</h2>,
                                      h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground mt-3 mb-1 first:mt-0">{children}</h3>,
                                      h4: ({ children }) => <h4 className="text-base font-semibold text-foreground mt-2 mb-1">{children}</h4>,
                                      p: ({ children }) => <p className="text-lg text-foreground/90 leading-relaxed mb-2 last:mb-0">{children}</p>,
                                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                      em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
                                      code: ({ children, className }) => {
                                        const isBlock = className?.includes("language-");
                                        return isBlock ? (
                                          <code className="block bg-muted border border-border rounded-lg px-4 py-3 text-sm font-mono text-foreground overflow-x-auto my-2">{children}</code>
                                        ) : (
                                          <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                                        );
                                      },
                                      pre: ({ children }) => <pre className="bg-muted border border-border rounded-lg p-0 my-2 overflow-x-auto">{children}</pre>,
                                      ul: ({ children }) => <ul className="list-disc list-inside text-lg text-foreground/90 space-y-1 my-2 pl-2">{children}</ul>,
                                      ol: ({ children }) => <ol className="list-decimal list-inside text-lg text-foreground/90 space-y-1 my-2 pl-2">{children}</ol>,
                                      li: ({ children }) => <li className="text-lg leading-relaxed">{children}</li>,
                                      blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-4 my-2 text-foreground/70 italic">{children}</blockquote>,
                                      hr: () => <hr className="border-border my-4" />,
                                      a: ({ href, children }) => <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/80" target="_blank" rel="noopener noreferrer">{children}</a>,
                                      table: ({ children }) => <div className="overflow-x-auto my-3"><table className="w-full text-base border-collapse border border-border rounded-lg">{children}</table></div>,
                                      thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                                      th: ({ children }) => <th className="text-left font-semibold text-foreground px-3 py-2 border border-border text-sm">{children}</th>,
                                      td: ({ children }) => <td className="px-3 py-2 border border-border text-foreground/90">{children}</td>,
                                      tr: ({ children }) => <tr className="even:bg-muted/30">{children}</tr>,
                                    }}
                                  >
                                    {part.text}
                                  </ReactMarkdown>
                                </div>
                              );
                            }

                            if (part.type === "tool-displayLocationData") {
                              if ((part.output as any)?.data?.length < 1) {
                                return (
                                  <div
                                    key={`${message.id}-locs-empty-${i}`}
                                    className="text-xs text-muted-foreground"
                                  >
                                    Couldn't retrieve locations. Please try again.
                                  </div>
                                );
                              }
                              return (
                                <div
                                  key={`${message.id}-locs-${i}`}
                                  className="flex flex-wrap gap-2 mt-2"
                                >
                                  {(part.output as any)?.data?.map(
                                    (data: any, index: number) => (
                                      <Badge
                                        key={`${message.id}-loc-${i}-${index}`}
                                        variant="outline"
                                        className="gap-1 rounded-full px-2 py-0.5 text-xs"
                                      >
                                        <MapPin className="h-3 w-3" />
                                        {data?.name}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              );
                            }

                            return null;
                          })}
                      </div>

                      {/* Web search sources */}
                      {message.role === "assistant" &&
                        message.parts.some(
                          (part) => part.type === "source-url",
                        ) && (
                          <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-border/10">
                            <span className="text-xs font-medium text-muted-foreground">
                              Sources
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {message.parts
                                .filter((part) => part.type === "source-url")
                                .map((part, i) => {
                                  const src = part as any;
                                  let host = src.url;
                                  try {
                                    host = new URL(src.url).hostname.replace(
                                      /^www\./,
                                      "",
                                    );
                                  } catch {}
                                  return (
                                    <a
                                      key={`${message.id}-src-${i}`}
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors max-w-[16rem] truncate"
                                      title={src.title || src.url}
                                    >
                                      <Globe className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {src.title || host}
                                      </span>
                                    </a>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                      {/* Bottom Action Row (Copy + View buttons) */}
                      {message.role === "assistant" && (
                        <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-border/10">
                          {/* Copy Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full flex-shrink-0"
                            onClick={() => handleCopy(message.id, getMessageText(message))}
                            title="Copy response"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Analysis Dialog Triggers */}
                          {message.parts
                            .filter((part) => isAnalysisPart(part))
                            .map((part, i) => {
                              switch (part.type) {
                                case "tool-displayAirData":
                                  return (
                                    <Dialog key={`${message.id}-air-${i}`}>
                                      <DialogTrigger asChild>
                                        {renderAnalysisButton("air", "Air", Wind)}
                                      </DialogTrigger>
                                      <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle className="sr-only">
                                            Air Quality Analysis
                                          </DialogTitle>
                                        </DialogHeader>
                                        <AirAIChatAnalysis
                                          airData={part.output as any}
                                          aiText={getMessageText(message)}
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  );

                                case "tool-displayWaterData":
                                  return (
                                    <Dialog key={`${message.id}-water-${i}`}>
                                      <DialogTrigger asChild>
                                        {renderAnalysisButton("water", "Water", Droplets)}
                                      </DialogTrigger>
                                      <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle className="sr-only">
                                            Water Quality Analysis
                                          </DialogTitle>
                                        </DialogHeader>
                                        <WaterAIChatAnalysis
                                          waterData={part.output as any}
                                          aiText={getMessageText(message)}
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  );

                                case "tool-displaySoilData":
                                  return (
                                    <Dialog key={`${message.id}-soil-${i}`}>
                                      <DialogTrigger asChild>
                                        {renderAnalysisButton("soil", "Soil", Sprout)}
                                      </DialogTrigger>
                                      <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle className="sr-only">
                                            Soil Quality Analysis
                                          </DialogTitle>
                                        </DialogHeader>
                                        <SoilAIChatAnalysis
                                          soilData={part.output as any}
                                          aiText={getMessageText(message)}
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  );

                                case "tool-displayNoiseData":
                                  return (
                                    <Dialog key={`${message.id}-noise-${i}`}>
                                      <DialogTrigger asChild>
                                        {renderAnalysisButton("noise", "Noise", Volume2)}
                                      </DialogTrigger>
                                      <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle className="sr-only">
                                            Noise Level Analysis
                                          </DialogTitle>
                                        </DialogHeader>
                                        <NoiseAIChatAnalysis
                                          noiseData={part.output as any}
                                          aiText={getMessageText(message)}
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  );

                                case "tool-displayBiodiversityData":
                                  return (
                                    <Dialog key={`${message.id}-bio-${i}`}>
                                      <DialogTrigger asChild>
                                        {renderAnalysisButton("biodiversity", "Biodiversity", Bird)}
                                      </DialogTrigger>
                                      <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle className="sr-only">
                                            Biodiversity Analysis
                                          </DialogTitle>
                                        </DialogHeader>
                                        <BiodiversityAIChatAnalysis
                                          biodiversityData={part.output as any}
                                          aiText={getMessageText(message)}
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  );

                                case "tool-displayWasteData":
                                  return (
                                    <Dialog key={`${message.id}-waste-${i}`}>
                                      <DialogTrigger asChild>
                                        {renderAnalysisButton("waste", "Waste", Trash2)}
                                      </DialogTrigger>
                                      <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle>
                                            Waste Management Analysis
                                          </DialogTitle>
                                          <DialogDescription>
                                            Detailed analysis of waste management
                                            data.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <WasteAIChatAnalysis
                                          wasteData={part.output as any}
                                          aiText={getMessageText(message)}
                                        />
                                      </DialogContent>
                                    </Dialog>
                                  );

                                default:
                                  return null;
                              }
                            })}
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                ))}

                {isThinking && <AIThinking />}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>

          {/* Input Area */}
          <div className="bg-background pt-4 pb-2 px-4">
            <PromptInput
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto"
              globalDrop
              multiple
            >
              <PromptInputBody className="rounded-lg">
                <PromptInputTextarea
                  onChange={(e) => setText(e.target.value)}
                  value={text}
                  placeholder={
                    reportMode
                      ? "Describe the report you want (e.g. air & water quality for Freetown last quarter)..."
                      : "Ask about environmental data, trends, or insights..."
                  }
                  className="min-h-[60px] resize-none focus:outline-none focus:ring-0"
                />
              </PromptInputBody>
              <PromptInputToolbar className="flex flex-row items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <PromptInputButton
                    variant="ghost"
                    onClick={() => setReportMode((prev) => !prev)}
                    aria-pressed={reportMode}
                    title="Structure the response as a formal report"
                    className={`m-0.5 h-7 gap-1 px-2 text-xs ${
                      reportMode
                        ? "bg-surface text-primary hover:bg-surface hover:text-primary"
                        : ""
                    }`}
                  >
                    <FileText className="size-3.5" />
                    <span>Report</span>
                  </PromptInputButton>
                  <PromptInputButton
                    variant="ghost"
                    onClick={() => setWebSearch((prev) => !prev)}
                    aria-pressed={webSearch}
                    title="Let the assistant search the web for extra context"
                    className={`m-0.5 h-7 gap-1 px-2 text-xs ${
                      webSearch
                        ? "bg-surface text-primary hover:bg-surface hover:text-primary"
                        : ""
                    }`}
                  >
                    <Globe className="size-3.5" />
                    <span>Web Search</span>
                  </PromptInputButton>
                </div>
                <PromptInputSubmit
                  disabled={!text && !status}
                  status={status}
                  className="bg-primary hover:bg-primary/90"
                />
              </PromptInputToolbar>
            </PromptInput>
            <p className="mt-2 text-center text-xs text-muted-foreground/60">
              Conversations are not stored — they are cleared when you leave this
              page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbotPage;
