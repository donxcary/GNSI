export const TaskStatusEnum = {
    BACKLOG: "backlog",
    TODO: "todo",
    IN_PROGRESS: "in-progress",
    IN_REVIEW: "in-review",
    DONE: "done",
    ARCHIVED: "archived",
} as const;

export const TaskPriorityEnum = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
} as const;

export type TaskStatusEnumType = (typeof TaskStatusEnum)[keyof typeof TaskStatusEnum];
export type TaskPriorityEnumType = (typeof TaskPriorityEnum)[keyof typeof TaskPriorityEnum];
