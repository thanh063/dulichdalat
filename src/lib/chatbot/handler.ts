import { FLOW } from "@/data/flow";
import { findPlace, itineraryFlexible, recommend } from "./rules";
import * as aiService from "./aiService";
import type { BotChoice, BotResponse, ClientPayload, Geo, ItinerarySlots, SessionContext } from "./types";

const sessionStore = new Map<string, SessionContext>();

const backToMenuChoice: BotChoice = {
  label: "⬅️ Menu chính",
  payload: { action: "go_node", value: "intro" },
};

function toBotChoice(label: string, payload: ClientPayload): BotChoice {
  return { label, payload };
}

function fromFlowChoices(choices: Array<{ label: string; next?: string | null; link?: string; payload?: ClientPayload }>): BotChoice[] {
  return choices.map((choice) => {
    if (choice.payload) {
      return toBotChoice(choice.label, choice.payload);
    }

    return {
      label: choice.label,
      payload: {
        action: choice.link ? "open_link" : "go_node",
        value: choice.link ?? choice.next ?? "intro",
      },
    };
  });
}

function buildPlaceChoices(places: Array<{ name: string; tags: string[]; gmapsLink?: string }>): BotChoice[] {
  return places.slice(0, 4).map((place) => {
    const isStay = place.tags.some((tag) => ["stay", "hotel", "homestay"].includes(tag));
    const isFood = place.tags.some((tag) => ["food", "nuong", "lau", "cafe"].includes(tag));

    if (isStay) {
      return toBotChoice(`🏨 Đặt: ${place.name}`, { action: "open_booking", value: place.name, type: "room" });
    }

    if (isFood) {
      return toBotChoice(`🍽️ Đặt: ${place.name}`, { action: "open_booking", value: place.name, type: "table" });
    }

    return toBotChoice(`📍 Map: ${place.name}`, { action: "open_link", value: place.gmapsLink ?? "#" });
  });
}

export async function handleMessage(
  q: string | null,
  payload: ClientPayload | null,
  sid: string,
  loc?: Geo,
): Promise<BotResponse> {
  const ctx = sessionStore.get(sid) ?? {};
  let origin = loc;
  const currentHour = new Date().getHours();

  if (payload?.action === "open_booking") {
    const bookingQuery = payload.type === "room" ? `đặt phòng ${payload.value}` : `đặt bàn ${payload.value}`;
    return handleMessage(bookingQuery, null, sid, loc);
  }

  if (payload?.action === "open_link") {
    return {
      response: `Bạn có thể mở liên kết này: ${payload.value}`,
      choices: [backToMenuChoice],
    };
  }

  if (payload?.action === "export_itinerary") {
    if (ctx.savedItinerary && ctx.savedItinerarySlots) {
      return {
        response: `Đây là lịch trình đã lưu của bạn:\n\n${ctx.savedItinerary}`,
        choices: [backToMenuChoice],
      };
    }

    return {
      response: "Bạn chưa có lịch trình nào để xuất.",
      choices: [backToMenuChoice],
    };
  }

  if (payload?.action === "go_node") {
    const node = FLOW.nodes[payload.value as keyof typeof FLOW.nodes];

    if (node) {
      ctx.lastIntent = undefined;
      ctx.itinerarySlots = undefined;
      sessionStore.set(sid, ctx);

      return {
        response: node.text,
        choices: fromFlowChoices(node.choices),
      };
    }
  }

  if (!q || !q.trim()) {
    const introNode = FLOW.nodes[FLOW.start as keyof typeof FLOW.nodes] ?? FLOW.nodes.intro;

    return {
      response: introNode.text,
      choices: fromFlowChoices(introNode.choices),
    };
  }

  const nluResult = await aiService.parseIntent(q, ctx.lastBotQuestion);

  if (ctx.lastIntent === "itinerary" && ctx.itinerarySlots) {
    const hasItinerarySlots = Boolean(
      nluResult.slots.days ||
      nluResult.slots.groupSize ||
      nluResult.slots.budget ||
      nluResult.slots.theme ||
      nluResult.slots.pace ||
      nluResult.slots.traveler_type,
    );

    const isStrongBreakingIntent = nluResult.intent === "specific_place" || nluResult.intent === "general_knowledge";

    if (hasItinerarySlots || !isStrongBreakingIntent) {
      nluResult.intent = "itinerary";
    }
  }

  if (nluResult.intent === "context_followup" && ctx.lastIntent && ctx.lastPickedPlace) {
    nluResult.intent = ctx.lastIntent;
    origin = ctx.lastPickedPlace.geo;
  }

  let responseText = "";
  let responseChoices: BotChoice[] = [backToMenuChoice];

  switch (nluResult.intent) {
    case "nuong":
    case "cafe":
    case "sight":
    case "food":
    case "stay":
    case "transport": {
      const rawPlaces = recommend(nluResult.intent, nluResult.slots, origin);

      if (rawPlaces.length > 0) {
        responseText = await aiService.generateAnswer(q, rawPlaces, nluResult.intent);
        ctx.lastIntent = nluResult.intent;
        if (rawPlaces[0]) {
          ctx.lastPickedPlace = rawPlaces[0];
        }

        if (nluResult.intent === "sight" && (currentHour >= 17 || currentHour < 6)) {
          responseText += "\n\nGợi ý nhỏ: giờ đã tối, bạn có thể chuyển sang ăn uống hoặc cafe gần đó thay vì đi tham quan.";
        }

        responseChoices = [...buildPlaceChoices(rawPlaces), backToMenuChoice];
      } else {
        responseText = await aiService.getGeneralAnswer(q);
      }

      if (ctx.itinerarySlots) {
        ctx.itinerarySlots = undefined;
      }
      break;
    }

    case "specific_place": {
      const placeName = nluResult.slots.name ?? nluResult.slots.near_place ?? q;
      const place = findPlace(placeName);

      if (place) {
        responseText = await aiService.generateAnswer(q, [place], "specific_place");
        ctx.lastPickedPlace = place;

        responseChoices = [
          toBotChoice("📍 Xem bản đồ", { action: "open_link", value: place.gmapsLink ?? "#" }),
          ...(place.tags.some((tag) => ["stay", "hotel"].includes(tag))
            ? [toBotChoice("🏨 Đặt phòng ngay", { action: "open_booking", value: place.name, type: "room" })]
            : []),
          ...(place.tags.some((tag) => ["food", "nuong"].includes(tag))
            ? [toBotChoice("🍽️ Đặt bàn ngay", { action: "open_booking", value: place.name, type: "table" })]
            : []),
          backToMenuChoice,
        ];
      } else {
        responseText = await aiService.getGeneralAnswer(q);
      }

      if (ctx.itinerarySlots) {
        ctx.itinerarySlots = undefined;
      }
      break;
    }

    case "booking": {
      const bookingNode = FLOW.nodes.booking;
      responseText = bookingNode.text;
      responseChoices = fromFlowChoices(bookingNode.choices);
      if (ctx.itinerarySlots) {
        ctx.itinerarySlots = undefined;
      }
      break;
    }

    case "general_knowledge": {
      responseText = await aiService.getGeneralAnswer(q);
      if (ctx.itinerarySlots) {
        ctx.itinerarySlots = undefined;
      }
      break;
    }

    case "itinerary": {
      ctx.itinerarySlots = { ...(ctx.itinerarySlots ?? {}), ...nluResult.slots };

      if (ctx.itinerarySlots.groupSize === 1) {
        ctx.itinerarySlots.traveler_type = "một mình";
      }

      const requiredSlots: (keyof ItinerarySlots)[] = ["days", "groupSize", "traveler_type", "budget", "theme", "pace"];
      const missingSlots = requiredSlots.filter((slot) => !ctx.itinerarySlots?.[slot]);

      if (missingSlots.length > 0) {
        const nextSlotToAsk = missingSlots[0];
        responseText = await aiService.askForNextSlot(ctx.itinerarySlots, nextSlotToAsk);
        ctx.lastBotQuestion = responseText;
        ctx.lastIntent = "itinerary";
        responseChoices = [backToMenuChoice];
      } else {
        responseText = "Tuyệt vời! Mình đã có đủ thông tin. Đợi một chút để lên lịch trình cho bạn nhé...\n\n";
        const places = itineraryFlexible(ctx.itinerarySlots);
        const itineraryQuery = `Tạo lịch trình ${ctx.itinerarySlots.days} ngày cho ${ctx.itinerarySlots.groupSize} người, đối tượng ${ctx.itinerarySlots.traveler_type}, kinh phí ${ctx.itinerarySlots.budget}, chủ đề ${ctx.itinerarySlots.theme}, nhịp độ ${ctx.itinerarySlots.pace}.`;
        const itineraryText = await aiService.generateAnswer(itineraryQuery, places, "itinerary");
        responseText += itineraryText;

        ctx.savedItinerary = itineraryText;
        ctx.savedItinerarySlots = { ...ctx.itinerarySlots };
        ctx.itinerarySlots = undefined;
        ctx.lastIntent = undefined;

        responseChoices = [
          ...buildPlaceChoices(places),
          toBotChoice("📥 Xuất file TXT", { action: "export_itinerary", value: "txt", type: "txt" }),
          backToMenuChoice,
        ];
      }
      break;
    }

    case "recall_itinerary": {
      if (ctx.savedItinerary && ctx.savedItinerarySlots) {
        responseText = `Đây là lịch trình ${ctx.savedItinerarySlots.days ?? ""} ngày mà mình đã tạo cho ${ctx.savedItinerarySlots.groupSize ?? ""} người (${ctx.savedItinerarySlots.traveler_type ?? ""}), kinh phí ${ctx.savedItinerarySlots.budget ?? ""}, chủ đề ${ctx.savedItinerarySlots.theme ?? ""}, nhịp độ ${ctx.savedItinerarySlots.pace ?? ""}:\n\n${ctx.savedItinerary}`;
        responseChoices = [
          toBotChoice("📥 Xuất file TXT", { action: "export_itinerary", value: "txt", type: "txt" }),
          backToMenuChoice,
        ];
      } else {
        responseText = "Bạn chưa tạo lịch trình nào với mình. Hãy thử nói: 'Tạo lịch trình 3 ngày 2 đêm' nhé!";
        responseChoices = [backToMenuChoice];
      }
      break;
    }

    default: {
      if (ctx.lastIntent === "itinerary" && ctx.itinerarySlots) {
        const requiredSlotsDefault: (keyof ItinerarySlots)[] = ["days", "groupSize", "traveler_type", "budget", "theme", "pace"];
        if (ctx.itinerarySlots.groupSize === 1) {
          ctx.itinerarySlots.traveler_type = "một mình";
        }

        const missingSlots = requiredSlotsDefault.filter((slot) => !ctx.itinerarySlots?.[slot]);
        const nextSlotToAsk = missingSlots[0] ?? "days";
        responseText = await aiService.askForNextSlot(ctx.itinerarySlots, nextSlotToAsk);
        responseChoices = [backToMenuChoice];
      } else {
        responseText = "Xin lỗi, mình chưa hiểu ý bạn lắm. Bạn có thể thử hỏi về một địa điểm cụ thể, đặt bàn, hoặc tạo lịch trình nhé.";
        responseChoices = [backToMenuChoice];
        if (ctx.itinerarySlots) {
          ctx.itinerarySlots = undefined;
        }
      }
    }
  }

  sessionStore.set(sid, ctx);

  return {
    response: responseText,
    choices: responseChoices,
  };
}
