import { AgeGroup } from "./ageGroup";
import { Rating } from "./rating";
import { TypeOfToy } from "./typeOfToy";

export interface Toy {
    "toyId": number;
    "name": string;
    "permalink": string;
    "description": string;
    "targetGroup": string;
    "productionDate": string;
    "price": number;
    "imageUrl": string;
    "ageGroup": AgeGroup;
    "type": TypeOfToy;
    "ratings": Rating[] | null;
}
