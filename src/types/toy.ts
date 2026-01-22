import { AgeGroup } from "./ageGroup";
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
}
