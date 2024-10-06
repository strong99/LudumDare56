import { Game } from "./game";

export interface ModifierDTO {

}

export class Modifier {
    public constructor(_: Game, __: ModifierDTO) {
        
    }

    public serialize(): ModifierDTO {
        throw new Error();
    }
}
