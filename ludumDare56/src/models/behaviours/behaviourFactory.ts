import { Entity } from "../entity";
import { AllBehaviour } from "./allBehaviour";
import { AnyBehaviour } from "./anyBehaviour";
import { AttackBehaviour } from "./attackBehaviour";
import { Behaviour, BehaviourDTO } from "./behaviour";
import { ClearPropertyBehaviour } from "./clearPropertyBehaviour";
import { ConstructBehaviour } from "./constructBehaviour";
import { DeleteBehaviour } from "./deleteBehaviour";
import { EqualsBehaviour } from "./equalsBehaviour";
import { GameOverBehaviour } from "./gameOverBehaviour";
import { GoToBehaviour } from "./goToBehaviour";
import { HasPropertyBehaviour } from "./hasPropertyBehaviour";
import { InRangeBehaviour } from "./inRangeBehaviour";

const behaviours = {
    // selectors
    all: AllBehaviour,
    any: AnyBehaviour,
    // modifiers
    goto: GoToBehaviour,
    construct: ConstructBehaviour,
    delete: DeleteBehaviour,
    gameOver: GameOverBehaviour,
    attack: AttackBehaviour,
    // conditions
    equals: EqualsBehaviour,
    inRange: InRangeBehaviour,    
    clearProperty: ClearPropertyBehaviour,
    hasProperty: HasPropertyBehaviour
};

export function CreateBehaviour(owner: Entity, behaviour: BehaviourDTO): Behaviour {
    return new (behaviours as any)[behaviour.type](owner, behaviour);
}
