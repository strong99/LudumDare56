# Ratvasion

Far in the hills a town is invaded by tiny creatures. It's up to the player to manage the towns defences.

```plantuml
@startuml

class World

World -> Entity
World -> Player

Library -> EntityTemplate
Entity -> EntityTemplate

Entity -> Tag
Tag <|-- MoveableTag
Tag <|-- AttackTag

Entity -> Behaviour

@enduml
```