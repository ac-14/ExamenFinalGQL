import { OptionalId } from "mongodb";

export type RestaurantModel = OptionalId<{
    name: string,
    city: string,
    country: string,
    street: string,
    number: string,
    lat: number,
    lng: number
}>