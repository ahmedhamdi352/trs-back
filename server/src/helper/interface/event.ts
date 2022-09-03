export interface IEvent {
  internalId?: number;
  eventName?: string;
  hotelName?: string;
  startDate?: Date;
  endDate?: Date;
  busOnly?: boolean;
  roomsOnly?: boolean;
  numberOfBuses?: number;
  numberOfRooms?: number;
  remainingRooms?: number;
  remainingChairs?: number;
}
