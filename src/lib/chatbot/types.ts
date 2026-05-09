export type ChatRole = "user" | "bot";

export type ChatChoiceAction = "go_node" | "open_link" | "open_booking" | "export_itinerary";

export type ChatChoice = {
  label: string;
  payload: {
    action: ChatChoiceAction;
    value: string;
  };
};

export type ChatMessage = {
  role: ChatRole;
  text: string;
};

export type ChatPayload = {
  action: ChatChoiceAction;
  value: string;
};

export type ChatContext = {
  q: string;
  sid: string;
  payload?: ChatPayload;
  loc?: string | null;
};

export type ChatResult = {
  message: string;
  choices: ChatChoice[];
};

export type SessionState = {
  history: ChatMessage[];
  lastBotMessage: string;
};