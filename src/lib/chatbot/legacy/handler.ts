import type { SessionContext, Geo, Place, BotResponse, ClientPayload, ItinerarySlots } from "@/lib/chatbot/types";
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Rules from "@/lib/chatbot/rules";
import * as aiService from "@/lib/chatbot/aiService";
import { findPlace } from "@/lib/chatbot/rules";
import { FLOW } from "@/data/flow";
import * as googleMapsService from "@/lib/chatbot/googleMapsService";

// In-memory session store
const sessionStore = new Map<string, SessionContext>();

const backToMenuChoice = {
  label: '⬅️ Menu chính',
  payload: { action: 'go_node' as const, value: 'intro' }
};

async function tryEnrichPlace(place: Place) {
  const details = await googleMapsService.getPlaceDetails(place.name, place.address || "");
  return { ...place, ...details } as Place;
}

export async function handleMessage(
  q: string | null,
  payload: ClientPayload | null,
  sid: string,
  loc?: Geo
): Promise<BotResponse> {
  const ctx = sessionStore.get(sid) || {};
  let origin = loc;
  const currentHour = new Date().getHours();

  if (payload && payload.action === 'go_node') {
    const nodeName = payload.value;
    const node = (FLOW.nodes as any)[nodeName];
    if (node) {
      const responseChoices = node.choices.map((choice: any) => ({
        label: choice.label,
        payload: { action: choice.link ? 'open_link' : 'go_node', value: choice.link || choice.next || 'intro' } as ClientPayload
      }));

      if (ctx.itinerarySlots) ctx.itinerarySlots = undefined;
      ctx.lastIntent = undefined;
      sessionStore.set(sid, ctx);

      return { response: node.text, choices: responseChoices } as BotResponse;
    }
  }

  if (q) {
    let responseText = '';
    const lastBotQuestion = ctx.lastBotQuestion || '';
    const nluResult = await aiService.parseIntent(q, lastBotQuestion);

    if (ctx.lastIntent === 'itinerary' && ctx.itinerarySlots) {
      const hasItinerarySlots = nluResult.slots.days || nluResult.slots.groupSize || nluResult.slots.budget || nluResult.slots.theme || nluResult.slots.pace || nluResult.slots.traveler_type;
      const isStrongBreakingIntent = ['specific_place', 'general_knowledge'].includes(nluResult.intent);
      if (hasItinerarySlots || !isStrongBreakingIntent) nluResult.intent = 'itinerary';
    }

    if (nluResult.intent === 'context_followup' && ctx.lastIntent && ctx.lastPickedPlace) {
      nluResult.intent = ctx.lastIntent;
      origin = ctx.lastPickedPlace.geo;
    }

    switch (nluResult.intent) {
      case 'nuong':
      case 'cafe':
      case 'sight':
      case 'food':
      case 'stay':
      case 'transport': {
        const rawPlaces = Rules.recommend(nluResult.intent as any, nluResult.slots, origin);
        if (rawPlaces.length > 0) {
          const places = await Promise.all(rawPlaces.map(async (p) => await tryEnrichPlace(p)));
          responseText = await aiService.generateAnswer(q, places, nluResult.intent);
          ctx.lastIntent = nluResult.intent;
          const firstPlace = places[0];
          if (places.length === 1) ctx.lastPickedPlace = firstPlace;

          if (nluResult.intent === 'sight' && (currentHour >= 17 || currentHour < 6)) {
            responseText += `\n\n💡 *Gợi ý nhỏ:* Bây giờ trời đã tối (thường các điểm tham quan đóng cửa lúc 17:00). Bạn có muốn mình gợi ý các **quán nướng** hoặc **lẩu** gần đó để ăn tối không?`;
            ctx.lastIntent = 'nuong';
            if (places.length > 0) ctx.lastPickedPlace = places[0];
          }

          const mentionedPlaces = places.filter(place => responseText.includes(place.name));
          const searchButtons = (mentionedPlaces.length > 0 ? mentionedPlaces : places).slice(0, 4).map(place => {
            const isStay = place.tags.includes('stay') || place.tags.includes('hotel') || place.tags.includes('homestay');
            const isFood = place.tags.includes('food') || place.tags.includes('nuong') || place.tags.includes('lau') || place.tags.includes('cafe');
            if (isStay) return { label: `🏨 Đặt: ${place.name}`, payload: { action: 'open_booking', value: place.name, type: 'room' } };
            else if (isFood) return { label: `🍽️ Đặt: ${place.name}`, payload: { action: 'open_booking', value: place.name, type: 'table' } };
            else return { label: `📍 Map: ${place.name}`, payload: { action: 'open_link', value: place.gmapsLink || '#' } };
          });

          const dynamicChoices = [...searchButtons, backToMenuChoice];
          sessionStore.set(sid, ctx);
          return { response: responseText, choices: dynamicChoices as any } as BotResponse;
        } else {
          responseText = await aiService.getGeneralAnswer(q);
        }
        if (ctx.itinerarySlots) ctx.itinerarySlots = undefined;
        break;
      }

      case 'specific_place': {
        const placeName = nluResult.slots.name || nluResult.slots.near_place || q;
        const placeRaw = findPlace(placeName);
        if (placeRaw) {
          const place = await tryEnrichPlace(placeRaw);
          responseText = await aiService.generateAnswer(q, [place], nluResult.intent);
          ctx.lastPickedPlace = place;

          const isClosed = (place as any).isOpen === false;
          if ((place.tags.includes('sight') && (currentHour >= 17 || currentHour < 6)) || isClosed) {
            responseText += `\n\n⚠️ *Lưu ý:* ${place.name} có thể đang đóng cửa. Bạn có muốn mình tìm **quán ăn ngon** gần đó thay thế không?`;
            ctx.lastIntent = 'food';
          }

          const isStay = place.tags.includes('stay') || place.tags.includes('hotel');
          const isFood = place.tags.includes('food') || place.tags.includes('nuong');
          const specificChoices: any[] = [
            { label: '📍 Xem bản đồ', payload: { action: 'open_link', value: (place as any).gmapsLink || '#' } }
          ];
          if (isStay) specificChoices.unshift({ label: '🏨 Đặt phòng ngay', payload: { action: 'open_booking', value: place.name, type: 'room' } });
          else if (isFood) specificChoices.unshift({ label: '🍽️ Đặt bàn ngay', payload: { action: 'open_booking', value: place.name, type: 'table' } });
          specificChoices.push(backToMenuChoice);

          sessionStore.set(sid, ctx);
          return { response: responseText, choices: specificChoices } as BotResponse;
        } else {
          responseText = await aiService.getGeneralAnswer(q);
        }
        if (ctx.itinerarySlots) ctx.itinerarySlots = undefined;
        break;
      }

      case 'booking': {
        const bookingNode = (FLOW.nodes as any).booking;
        if (bookingNode) {
          const bookingChoices = bookingNode.choices.map((choice: any) => {
            if ((choice as any).payload) return { label: choice.label, payload: (choice as any).payload };
            return { label: choice.label, payload: { action: choice.link ? 'open_link' : 'go_node', value: choice.link || choice.next || 'intro' } as ClientPayload };
          });
          sessionStore.set(sid, ctx);
          return { response: bookingNode.text, choices: bookingChoices as any } as BotResponse;
        } else {
          responseText = 'Xin lỗi, chức năng đặt bàn hiện tại chưa khả dụng.';
        }
        if (ctx.itinerarySlots) ctx.itinerarySlots = undefined;
        break;
      }

      case 'general_knowledge':
        responseText = await aiService.getGeneralAnswer(q);
        if (ctx.itinerarySlots) ctx.itinerarySlots = undefined;
        break;

      case 'itinerary': {
        if (!ctx.itinerarySlots) ctx.itinerarySlots = {};
        ctx.itinerarySlots = { ...ctx.itinerarySlots, ...nluResult.slots };
        const requiredSlots: (keyof ItinerarySlots)[] = ['days', 'groupSize', 'traveler_type', 'budget', 'theme', 'pace'];
        if (ctx.itinerarySlots.groupSize === 1) ctx.itinerarySlots.traveler_type = 'một mình';
        const missingSlots = requiredSlots.filter(slot => !ctx.itinerarySlots![slot]);
        if (missingSlots.length > 0) {
          const nextSlotToAsk = missingSlots[0];
          responseText = await aiService.askForNextSlot(ctx.itinerarySlots, nextSlotToAsk);
          ctx.lastBotQuestion = responseText;
          ctx.lastIntent = 'itinerary';
        } else {
          responseText = 'Tuyệt vời! Tôi đã có đủ thông tin. Đợi tôi một chút để lên lịch trình cho bạn nhé...\n\n';
          const places = Rules.itineraryFlexible(ctx.itinerarySlots);
          const itineraryQuery = `Tạo lịch trình ${ctx.itinerarySlots.days} ngày cho ${ctx.itinerarySlots.groupSize} người (đối tượng: ${ctx.itinerarySlots.traveler_type}), kinh phí ${ctx.itinerarySlots.budget}, chủ đề ${ctx.itinerarySlots.theme}, nhịp độ ${ctx.itinerarySlots.pace}.`;
          const itineraryText = await aiService.generateAnswer(itineraryQuery, places, 'itinerary');
          responseText += itineraryText;
          ctx.savedItinerary = itineraryText;
          ctx.savedItinerarySlots = { ...ctx.itinerarySlots };
          const mentionedPlaces = places.filter(place => itineraryText.includes(place.name));
          const itineraryButtons = (mentionedPlaces.length > 0 ? mentionedPlaces : places).slice(0, 6).map(place => {
            const isStay = place.tags.includes('stay') || place.tags.includes('hotel') || place.tags.includes('homestay');
            const isFood = place.tags.includes('food') || place.tags.includes('nuong') || place.tags.includes('lau') || place.tags.includes('cafe');
            if (isStay) return { label: `🏨 Đặt: ${place.name}`, payload: { action: 'open_booking', value: place.name, type: 'room' } };
            else if (isFood) return { label: `🍽️ Đặt: ${place.name}`, payload: { action: 'open_booking', value: place.name, type: 'table' } };
            else return { label: `📍 Map: ${place.name}`, payload: { action: 'open_link', value: place.gmapsLink || '#' } };
          });
          const finalChoices = [...itineraryButtons, backToMenuChoice];
          ctx.itinerarySlots = undefined;
          ctx.lastIntent = undefined;
          sessionStore.set(sid, ctx);
          return { response: responseText, choices: [ ...finalChoices, { label: '📥 Xuất file TXT', payload: { action: 'export_itinerary', value: 'txt' } as any } ] as any } as BotResponse;
        }
        break;
      }

      case 'recall_itinerary':
        if (ctx.savedItinerary && ctx.savedItinerarySlots) {
          responseText = `Đây là lịch trình ${ctx.savedItinerarySlots.days} ngày mà tôi đã tạo cho ${ctx.savedItinerarySlots.groupSize} người (${ctx.savedItinerarySlots.traveler_type}), kinh phí ${ctx.savedItinerarySlots.budget}, chủ đề ${ctx.savedItinerarySlots.theme}, nhịp độ ${ctx.savedItinerarySlots.pace}:\n\n${ctx.savedItinerary}`;
          sessionStore.set(sid, ctx);
          return { response: responseText, choices: [ { label: '📥 Xuất file TXT', payload: { action: 'export_itinerary', value: 'txt' } as any }, backToMenuChoice ] } as BotResponse;
        } else {
          responseText = 'Bạn chưa tạo lịch trình nào với tôi. Hãy bắt đầu bằng cách nói "Tạo lịch trình" nhé!';
        }
        break;

      default:
        if (ctx.lastIntent === 'itinerary' && ctx.itinerarySlots) {
          const requiredSlotsDefault: (keyof ItinerarySlots)[] = ['days','groupSize','traveler_type','budget','theme','pace'];
          if (ctx.itinerarySlots.groupSize === 1) ctx.itinerarySlots.traveler_type = 'một mình';
          const missingSlots = requiredSlotsDefault.filter(slot => !ctx.itinerarySlots![slot]);
          const nextSlotToAsk = missingSlots[0] || 'days';
          responseText = await aiService.askForNextSlot(ctx.itinerarySlots!, nextSlotToAsk);
        } else {
          responseText = 'Xin lỗi, tôi chưa hiểu ý bạn lắm. Bạn có thể chọn từ Menu chính hoặc hỏi tôi về một địa điểm cụ thể.';
          if (ctx.itinerarySlots) ctx.itinerarySlots = undefined;
        }
    }

    sessionStore.set(sid, ctx);
    return { response: responseText, choices: ctx.lastIntent === 'itinerary' ? [] : [backToMenuChoice] } as BotResponse;
  }

  return handleMessage(null, { action: 'go_node', value: 'intro' }, sid, loc);
}

// handler exported via function declaration above
