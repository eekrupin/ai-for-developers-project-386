import type { AvailabilityWindow, Booking, EventType, Owner } from "../domain/types";

const DEFAULT_OWNER: Owner = {
  id: "owner-default",
  name: "Владелец календаря",
};

export class MemoryStore {
  owner: Owner = { ...DEFAULT_OWNER };

  eventTypes: EventType[] = [];

  availabilityWindows: AvailabilityWindow[] = [];

  bookings: Booking[] = [];
}
