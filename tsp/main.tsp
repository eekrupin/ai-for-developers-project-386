import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{ title: "Call Booking API" })
namespace CalendarApi;

// В системе один заранее заданный владелец календаря.
// Регистрация и авторизация в рамках этого контракта отсутствуют.

alias EventTypeId = string;
alias AvailabilityWindowId = string;
alias BookingId = string;

model Owner {
  id: string;
  name: string;
}

model EventType {
  id: EventTypeId;
  name: string;
  description: string;
  durationMinutes: int32;
}

model CreateEventTypeRequest {
  name: string;
  description: string;
  durationMinutes: int32;
}

model AvailabilityWindow {
  id: AvailabilityWindowId;
  startAt: utcDateTime;
  endAt: utcDateTime;
}

model PublishAvailabilityWindowRequest {
  startAt: utcDateTime;
  endAt: utcDateTime;
}

enum BookingStatus {
  confirmed,
  cancelled,
}

model Booking {
  id: BookingId;
  eventTypeId: EventTypeId;
  eventTypeName: string;
  startAt: utcDateTime;
  endAt: utcDateTime;
  guestName: string;
  guestEmail: string;
  guestComment?: string;
  status: BookingStatus;
  createdAt: utcDateTime;
}

model CreateBookingRequest {
  eventTypeId: EventTypeId;
  startAt: utcDateTime;
  endAt: utcDateTime;
  guestName: string;
  guestEmail: string;
  guestComment?: string;
}

// Публичный слот вычисляется из доступности владельца, длительности типа события и уже существующих бронирований.
model AvailableSlot {
  eventTypeId: EventTypeId;
  startAt: utcDateTime;
  endAt: utcDateTime;
}

model ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

model BusyConflictDetails {
  requestedStartAt: utcDateTime;
  requestedEndAt: utcDateTime;
  conflictingBookingId?: BookingId;
}

@error
model BadRequestError extends ErrorResponse {
  @statusCode
  statusCode: 400;
}

@error
model NotFoundError extends ErrorResponse {
  @statusCode
  statusCode: 404;
}

@error
model ValidationError extends ErrorResponse {
  @statusCode
  statusCode: 422;
}

@error
model BookingTimeConflictError {
  @statusCode
  statusCode: 409;

  code: "booking_time_conflict";
  // Конфликт проверяется глобально для всего календаря, а не только внутри одного типа события.
  message: string;
  details: BusyConflictDetails;
}

model CreatedEventType extends EventType {
  @statusCode
  statusCode: 201;
}

model CreatedAvailabilityWindow extends AvailabilityWindow {
  @statusCode
  statusCode: 201;
}

model CreatedBooking extends Booking {
  @statusCode
  statusCode: 201;
}

@route("/owner/profile")
interface OwnerProfileApi {
  @get
  getOwnerProfile(): Owner;
}

@route("/owner/event-types")
interface OwnerEventTypesApi {
  @get
  listEventTypes(): EventType[];

  @post
  createEventType(
    @body input: CreateEventTypeRequest,
  ): CreatedEventType | BadRequestError;
}

@route("/owner/availability-windows")
interface OwnerAvailabilityApi {
  @get
  listAvailabilityWindows(): AvailabilityWindow[];

  @post
  publishAvailabilityWindow(
    @body input: PublishAvailabilityWindowRequest,
  ): CreatedAvailabilityWindow | BadRequestError | ValidationError;
}

@route("/owner/bookings/upcoming")
interface OwnerBookingsApi {
  @get
  listUpcomingBookings(): Booking[];
}

@route("/event-types")
interface GuestEventTypesApi {
  @get
  listPublicEventTypes(): EventType[];

  @get
  @route("/{eventTypeId}")
  getEventType(
    @path eventTypeId: EventTypeId,
  ): EventType | NotFoundError;

  @get
  @route("/{eventTypeId}/slots")
  listAvailableSlots(
    @path eventTypeId: EventTypeId,
    @query from: utcDateTime,
    @query to: utcDateTime,
  ): AvailableSlot[] | BadRequestError | NotFoundError;
}

@route("/bookings")
interface GuestBookingsApi {
  @post
  createBooking(
    @body input: CreateBookingRequest,
  ):
    | CreatedBooking
    | BadRequestError
    | NotFoundError
    | ValidationError
    | BookingTimeConflictError;
}
