from enum import Enum


class SetType(str, Enum):
    WARM_UP = "warm_up"
    NORMAL = "normal"
    DROP_SET = "drop_set"
    FAILURE = "failure"


class MuscleGroup(str, Enum):
    CHEST = "chest"
    LATS = "lats"
    UPPER_BACK = "upper_back"
    TRAPS = "traps"

    BICEPS = "biceps"
    TRICEPS = "triceps"
    FOREARMS = "forearms"

    FRONT_DELTS = "front_delts"
    SIDE_DELTS = "side_delts"
    REAR_DELTS = "rear_delts"

    QUADS = "quads"
    HAMSTRINGS = "hamstrings"
    GLUTES = "glutes"

    CALVES = "calves"

    ABS = "abs"
    OBLIQUES = "obliques"

    LOWER_BACK = "lower_back"

    ADDUCTORS = "adductors"
    ABDUCTORS = "abductors"

    CARDIO = "cardio"


class Equipment(str, Enum):
    NONE = "none"
    BARBELL = "barbell"
    DUMBBELL = "dumbbell"
    KETTLEBELL = "kettlebell"
    CABLE = "cable"
    MACHINE = "machine"
    PLATE = "plate"
