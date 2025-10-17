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
  PromptInputToolbar
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
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
import { BarChart3 } from "lucide-react";
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

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
            <div className="w-full max-w-4xl flex flex-col h-[calc(100vh-8rem)] rounded-lg overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Conversation className="flex-1 bg-background">
                  <ConversationContent className="flex-1 overflow-y-auto">
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
                              case "tool-displayLocationData":
                                if((part.output as any)?.data.length < 1){
                                  return <Response key={`${message.id}-${i}`}>
                                    Couldn't get locations, try again
                                  </Response>
                                }
                                return(
                                  <div key={`${message.id}-${i}-locations`} className="flex flex-row gap-2">
                                  {
                                    (part.output as any)?.data?.map((data:any,index:number) =>{
                                      return(<span key={`${message.id}-${i}-location-${index}`}>{data?.name}</span>)
                                  })
                                }
                                  </div>
                                )
                             
    
                              case "tool-displayAirData":
                                return (
                                  <Dialog key={`${message.id}-${i}-dialog`}>
                                    <DialogTrigger asChild>
                                       <Button variant="link" className="mt-2">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        View Air Analysis
                                      </Button>
                                    </DialogTrigger>
                                <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="sr-only">Air Quality Analysis</DialogTitle>
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
                                       <Button variant="link" className="mt-2">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        View Water Analysis
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="sr-only">Water Quality Analysis</DialogTitle>
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
                                       <Button variant="link" className="mt-2">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        View Soil Analysis
                                      </Button>
                                    </DialogTrigger>
                                                <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="sr-only">Soil Quality Analysis</DialogTitle>
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
                                       <Button variant="link" className="mt-2">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        View Noise Analysis
                                      </Button>
                                    </DialogTrigger>
                                                  <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="sr-only">Noise Level Analysis</DialogTitle>
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
                                       <Button variant="link" className="mt-2">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        View Biodiversity Analysis
                                      </Button>
                                    </DialogTrigger>
                                              <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle className="sr-only">Biodiversity Analysis</DialogTitle>
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
                                       <Button variant="link" className="mt-2">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        View Waste Analysis
                                      </Button>
                                    </DialogTrigger>
                    <DialogContent className="min-w-fit md:min-w-6xl max-h-[90vh] overflow-y-auto">
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
              </div>
    
              {/* Input Area */}
              <div className="border-t p-4 bg-background">
                <PromptInput
                  onSubmit={handleSubmit}
                  className="max-w-2xl mx-auto"
                  globalDrop
                  multiple
                >
                  <PromptInputBody>
                    <PromptInputTextarea
                      onChange={(e) => setText(e.target.value)}
                      value={text}
                      placeholder="Type your message..."
                    />
                  </PromptInputBody>
                  <PromptInputToolbar className="flex flex-row justify-end gap-2">
                    <PromptInputSubmit disabled={!text && !status} status={status} />
                  </PromptInputToolbar>
                </PromptInput>
              </div>
            </div>
    </div>
  );
};

export default AIChatRoom;