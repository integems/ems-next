"use client";

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { GlobeIcon, MicIcon } from "lucide-react";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AirAIChatAnalysis from "../air/AirAIChatAnalysisComponent";
import WaterAIChatAnalysis from "../water/WaterAIChatAnalysisComponent";
import SoilAIChatAnalysis from "../soil/SoilAIChatAnalysisComponent";
import NoiseAIChatAnalysis from "../noise/NoiseAIChatAnalysisComponent";
import BiodiversityAIChatAnalysis from "../biodiversity/BiodiversityAIChatAnalysisComponent";
import WasteAIChatAnalysis from "../waste/WasteAIChatAnalysisComponent";

// Dummy Components for each data type
const AirDataDisplay = () => (
  <div className="p-4 bg-blue-100 rounded-md">These are air data.</div>
);
const WaterDataDisplay = () => (
  <div className="p-4 bg-green-100 rounded-md">These are water data.</div>
);
const SoilDataDisplay = () => (
  <div className="p-4 bg-yellow-100 rounded-md">These are soil data.</div>
);
const NoiseDataDisplay = () => (
  <div className="p-4 bg-purple-100 rounded-md">These are noise data.</div>
);
const BiodiversityDataDisplay = () => (
  <div className="p-4 bg-red-100 rounded-md">These are biodiversity data.</div>
);
const WasteDataDisplay = () => (
  <div className="p-4 bg-gray-100 rounded-md">These are waste data.</div>
);
const LocationDataDisplay = () => (
  <div className="p-4 bg-orange-100 rounded-md">These are location data.</div>
);

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

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    console.log({ part });
                    switch (part.type) {
                      case "text":
                        return (
                          <Response key={`${message.id}-${i}`}>
                            {part.text}
                          </Response>
                        );
                      case "tool-displayAirData":
                        return (<Dialog key={`${message.id}-${i}-dialog`}>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="mt-2">
                                View Air Analysis
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Air Quality Analysis</DialogTitle>
                                <DialogDescription>
                                  Detailed analysis of air quality data.
                                </DialogDescription>
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
                              <Button variant="outline" className="mt-2">
                                View Water Analysis
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Water Quality Analysis</DialogTitle>
                                <DialogDescription>
                                  Detailed analysis of water quality data.
                                </DialogDescription>
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
                              <Button variant="outline" className="mt-2">
                                View Soil Analysis
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Soil Quality Analysis</DialogTitle>
                                <DialogDescription>
                                  Detailed analysis of soil quality data.
                                </DialogDescription>
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
                              <Button variant="outline" className="mt-2">
                                View Noise Analysis
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Noise Level Analysis</DialogTitle>
                                <DialogDescription>
                                  Detailed analysis of noise level data.
                                </DialogDescription>
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
                              <Button variant="outline" className="mt-2">
                                View Biodiversity Analysis
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Biodiversity Analysis</DialogTitle>
                                <DialogDescription>
                                  Detailed analysis of biodiversity data.
                                </DialogDescription>
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
                              <Button variant="outline" className="mt-2">
                                View Waste Analysis
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Waste Management Analysis</DialogTitle>
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

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4"
          globalDrop
          multiple
        >
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit disabled={!text && !status} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default AIChatRoom;
