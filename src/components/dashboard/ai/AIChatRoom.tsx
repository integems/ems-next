"use client";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
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
import {
  Bird,
  Droplets,
  MapPin,
  Sparkles,
  Sprout,
  Trash2,
  Volume2,
  Wind,
} from "lucide-react";
import { useState } from "react";
import AirAIChatAnalysis from "../air/AirAIChatAnalysisComponent";
import BiodiversityAIChatAnalysis from "../biodiversity/BiodiversityAIChatAnalysisComponent";
import NoiseAIChatAnalysis from "../noise/NoiseAIChatAnalysisComponent";
import SoilAIChatAnalysis from "../soil/SoilAIChatAnalysisComponent";
import WasteAIChatAnalysis from "../waste/WasteAIChatAnalysisComponent";
import WaterAIChatAnalysis from "../water/WaterAIChatAnalysisComponent";

const AIChatRoom = () => {
  const [text, setText] = useState<string>("");
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  const { messages, status, sendMessage } = useChat();

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
        body: {
          webSearch: useWebSearch,
        },
      },
    );
    setText("");
  };

  const renderAnalysisButton = (type: string, label: string, icon: any) => {
    const Icon = icon;
    return (
      <Button
        variant="outline"
        className="group hover:bg-primary/5 hover:border-primary/50 transition-all"
        size="sm"
      >
        <Icon className="mr-2 h-4 w-4 text-primary" />
        <span className="font-medium">View {label} Analysis</span>
      </Button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg h-[600px]">
      <div className="w-full max-w-4xl flex flex-col h-full rounded-xl overflow-hidden bg-card shadow-lg">
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
                      Environmental AI Assistant
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

              {messages.map((message) => (
                <Message
                  from={message.role}
                  key={message.id}
                  className={`mb-4 ${message.role === "assistant" ? "bg-transparent" : ""}`}
                >
                  <MessageContent className="rounded-lg">
                    {message.parts.map((part, i) => {
                      console.log({ part });
                      switch (part.type) {
                        case "text":
                          return (
                            <Response
                              key={`${message.id}-${i}`}
                              className="prose prose-sm max-w-none"
                            >
                              {part.text}
                            </Response>
                          );

                        case "tool-displayLocationData":
                          if ((part.output as any)?.data.length < 1) {
                            return (
                              <Response
                                key={`${message.id}-${i}`}
                                className="text-muted-foreground"
                              >
                                Couldn't retrieve locations. Please try again.
                              </Response>
                            );
                          }
                          return (
                            <div
                              key={`${message.id}-${i}-locations`}
                              className="flex flex-wrap gap-2 mt-2"
                            >
                              {(part.output as any)?.data?.map(
                                (data: any, index: number) => (
                                  <Badge
                                    key={`${message.id}-${i}-location-${index}`}
                                    variant="outline"
                                    className="gap-1"
                                  >
                                    <MapPin className="h-3 w-3" />
                                    {data?.name}
                                  </Badge>
                                ),
                              )}
                            </div>
                          );

                        case "tool-displayAirData":
                          return (
                            <Dialog key={`${message.id}-${i}-dialog`}>
                              <DialogTrigger asChild>
                                {renderAnalysisButton(
                                  "air",
                                  "Air Quality",
                                  Wind,
                                )}
                              </DialogTrigger>
                              <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="sr-only">
                                    Air Quality Analysis
                                  </DialogTitle>
                                </DialogHeader>
                                <AirAIChatAnalysis
                                  airData={part.output as any}
                                />
                              </DialogContent>
                            </Dialog>
                          );

                        case "tool-displayWaterData":
                          return (
                            <Dialog key={`${message.id}-${i}-dialog`}>
                              <DialogTrigger asChild>
                                {renderAnalysisButton(
                                  "water",
                                  "Water Quality",
                                  Droplets,
                                )}
                              </DialogTrigger>
                              <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="sr-only">
                                    Water Quality Analysis
                                  </DialogTitle>
                                </DialogHeader>
                                <WaterAIChatAnalysis
                                  waterData={part.output as any}
                                />
                              </DialogContent>
                            </Dialog>
                          );

                        case "tool-displaySoilData":
                          return (
                            <Dialog key={`${message.id}-${i}-dialog`}>
                              <DialogTrigger asChild>
                                {renderAnalysisButton(
                                  "soil",
                                  "Soil Health",
                                  Sprout,
                                )}
                              </DialogTrigger>
                              <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="sr-only">
                                    Soil Quality Analysis
                                  </DialogTitle>
                                </DialogHeader>
                                <SoilAIChatAnalysis
                                  soilData={part.output as any}
                                />
                              </DialogContent>
                            </Dialog>
                          );

                        case "tool-displayNoiseData":
                          return (
                            <Dialog key={`${message.id}-${i}-dialog`}>
                              <DialogTrigger asChild>
                                {renderAnalysisButton(
                                  "noise",
                                  "Noise Level",
                                  Volume2,
                                )}
                              </DialogTrigger>
                              <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="sr-only">
                                    Noise Level Analysis
                                  </DialogTitle>
                                </DialogHeader>
                                <NoiseAIChatAnalysis
                                  noiseData={part.output as any}
                                />
                              </DialogContent>
                            </Dialog>
                          );

                        case "tool-displayBiodiversityData":
                          return (
                            <Dialog key={`${message.id}-${i}-dialog`}>
                              <DialogTrigger asChild>
                                {renderAnalysisButton(
                                  "biodiversity",
                                  "Biodiversity",
                                  Bird,
                                )}
                              </DialogTrigger>
                              <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="sr-only">
                                    Biodiversity Analysis
                                  </DialogTitle>
                                </DialogHeader>
                                <BiodiversityAIChatAnalysis
                                  biodiversityData={part.output as any}
                                />
                              </DialogContent>
                            </Dialog>
                          );

                        case "tool-displayWasteData":
                          return (
                            <Dialog key={`${message.id}-${i}-dialog`}>
                              <DialogTrigger asChild>
                                {renderAnalysisButton(
                                  "waste",
                                  "Waste Management",
                                  Trash2,
                                )}
                              </DialogTrigger>
                              <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Waste Management Analysis
                                  </DialogTitle>
                                  <DialogDescription>
                                    Detailed analysis of waste management data.
                                  </DialogDescription>
                                </DialogHeader>
                                <WasteAIChatAnalysis
                                  wasteData={part.output as any}
                                />
                              </DialogContent>
                            </Dialog>
                          );

                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-card">
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
                placeholder="Ask about environmental data, trends, or insights..."
                className="min-h-[60px] resize-none focus:outline-none focus:ring-0"
              />
            </PromptInputBody>
            <PromptInputToolbar className="flex flex-row justify-end gap-2 mt-2">
              <PromptInputSubmit
                disabled={!text && !status}
                status={status}
                className="bg-primary hover:bg-primary/90"
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default AIChatRoom;
